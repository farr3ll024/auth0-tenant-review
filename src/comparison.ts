export type Status = "changed" | "missing" | "match" | "target-only";
export type Severity = "High" | "Medium" | "Low" | "None";
export type Resource = { type: string; name: string; key: string; value: Record<string, unknown> };
export type Tenant = { name: string; domain: string; fileName: string; importedAt: string; resources: Resource[] };
export type ComparisonItem = { id: string; type: string; name: string; source: string; target: string; status: Status; severity: Severity; detail: string; changedFields: string[] };

const collections: Array<[string[], string]> = [
  [["clients", "applications"], "Application"],
  [["connections"], "Connection"],
  [["resourceServers", "resource_servers", "apis"], "API"],
  [["actions"], "Action"],
  [["organizations"], "Organization"],
  [["rules"], "Rule"],
];
const ignored = new Set(["client_secret", "signing_keys", "created_at", "updated_at", "id"]);

function normalizedName(name: string) {
  return name.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");
}

function resourceKey(type: string, value: Record<string, unknown>, name: string) {
  if (type === "Application" || type === "API") return `${type}:name:${normalizedName(name)}`;
  const identity = firstString(value, ["client_id", "identifier", "name", "id"]);
  return `${type}:id:${identity}`;
}

function clean(value: unknown, extraIgnored: Set<string>): unknown {
  if (Array.isArray(value)) return value.map(item => clean(item, extraIgnored));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value as Record<string, unknown>).filter(([key]) => !ignored.has(key) && !extraIgnored.has(key)).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, clean(item, extraIgnored)]));
  return value;
}
function firstString(record: Record<string, unknown>, keys: string[]) { for (const key of keys) if (typeof record[key] === "string" && record[key]) return record[key] as string; return "Unnamed object"; }
function summary(resource?: Resource) {
  if (!resource) return "Not found";
  const value = resource.value;
  if (resource.type === "Application") return String(value.app_type ?? value.application_type ?? "Application");
  if (resource.type === "API") return `${Array.isArray(value.scopes) ? value.scopes.length : 0} permissions`;
  if (resource.type === "Action") return String(value.status ?? (value.deployed ? "Deployed" : "Action"));
  if (resource.type === "Connection") return String(value.strategy ?? "Connection");
  if (resource.type === "Organization") return `${Array.isArray(value.enabled_connections) ? value.enabled_connections.length : 0} connections`;
  return String(value.enabled === false ? "Disabled" : "Enabled");
}

export function parseTenant(raw: unknown, fileName: string): Tenant {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error(`${fileName} must contain a JSON object.`);
  const data = raw as Record<string, unknown>;
  const resources: Resource[] = [];
  const resourceKeys = new Set<string>();
  for (const [aliases, type] of collections) {
    const key = aliases.find(alias => Array.isArray(data[alias]));
    if (!key) continue;
    for (const entry of data[key] as unknown[]) {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
      const value = entry as Record<string, unknown>;
      const name = firstString(value, ["name", "display_name", "client_id", "identifier", "id"]);
      const resourceKeyValue = resourceKey(type, value, name);
      if (resourceKeys.has(resourceKeyValue)) throw new Error(`${fileName} contains more than one ${type} named "${name}". Name-based comparison would be ambiguous.`);
      resourceKeys.add(resourceKeyValue);
      resources.push({ type, name, key: resourceKeyValue, value });
    }
  }
  if (!resources.length) throw new Error(`${fileName} has no supported Auth0 collections. Expected clients, connections, resourceServers, actions, organizations, or rules.`);
  const domain = firstString(data, ["domain", "tenant_domain"]);
  const fallbackName = fileName.replace(/\.json$/i, "");
  return { name: firstString(data, ["tenant", "tenant_name", "name"]) === "Unnamed object" ? fallbackName : firstString(data, ["tenant", "tenant_name", "name"]), domain: domain === "Unnamed object" ? "Domain not provided" : domain, fileName, importedAt: new Date().toISOString(), resources };
}

export function compareTenants(source: Tenant, target: Tenant): ComparisonItem[] {
  const sourceMap = new Map(source.resources.map(item => [item.key, item]));
  const targetMap = new Map(target.resources.map(item => [item.key, item]));
  return [...new Set([...sourceMap.keys(), ...targetMap.keys()])].map((key) => {
    const a = sourceMap.get(key); const b = targetMap.get(key); const type = (a ?? b)!.type;
    let status: Status = "match"; let changedFields: string[] = [];
    if (!b) status = "missing"; else if (!a) status = "target-only"; else {
      const typeSpecificIgnored = new Set(type === "Application" ? ["client_id", "name", "display_name"] : type === "API" ? ["identifier", "name", "display_name"] : []);
      const left = clean(a.value, typeSpecificIgnored) as Record<string, unknown>; const right = clean(b.value, typeSpecificIgnored) as Record<string, unknown>;
      changedFields = [...new Set([...Object.keys(left), ...Object.keys(right)])].filter(field => JSON.stringify(left[field]) !== JSON.stringify(right[field]));
      if (changedFields.length) status = "changed";
    }
    const severity: Severity = status === "match" ? "None" : ["Application", "Action", "API"].includes(type) ? "High" : ["Connection", "Organization"].includes(type) ? "Medium" : "Low";
    const detail = status === "match" ? "The normalized configuration matches." : status === "missing" ? "This object exists in the source but not the target." : status === "target-only" ? "This object exists only in the target." : `Different fields: ${changedFields.join(", ")}.`;
    return { id: key, type, name: (a ?? b)!.name, source: summary(a), target: summary(b), status, severity, detail, changedFields };
  }).sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
}
