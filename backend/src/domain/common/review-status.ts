/** Inclui alterações antigas sem precisar migrar os cadastros existentes. */
export function reviewStatusFilter(status?: string): Record<string, unknown> {
  if (status === "ALTERADO") {
    return {
      $or: [
        { status: "ALTERADO" },
        { status: "PENDENTE", origemPendencia: "ALTERACAO" },
      ],
    };
  }
  if (status === "PENDENTE") {
    return { status, origemPendencia: { $ne: "ALTERACAO" } };
  }
  return status ? { status } : { status: { $in: ["PENDENTE", "ALTERADO"] } };
}
