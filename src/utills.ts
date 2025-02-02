export function escapeHtml(str: string): string {
    const entityMap: { [key: string]: string } = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return str.replace(/[<>&"']/g, (match) => entityMap[match]);
  }