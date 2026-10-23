// Fields of a CSV row as Python writes them in the knowledge base: a quoted comma doesn't
// split fields and "" inside quotes is a quote.
export function csvFields(row: string) {
    const cells = [""];
    let quoted = false;
    for (let index = 0; index < row.length; index++) {
        const char = row[index];
        if (char === '"' && quoted && row[index + 1] === '"') {
            cells[cells.length - 1] += '"';
            index++;
        } else if (char === '"') quoted = !quoted;
        else if (char === "," && !quoted) cells.push("");
        else cells[cells.length - 1] += char;
    }
    return cells;
}
