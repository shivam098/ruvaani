export async function apiRequest<T>(path: string, data: object, method = "POST"): Promise<T> {
  const response = await fetch(path, {
    method, headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result: unknown = await response.json();
  if (!response.ok) {
    const message = result && typeof result === "object" && "error" in result && typeof result.error === "string" ? result.error : "We could not complete this request. Please try again.";
    throw new Error(message);
  }
  return result as T;
}
