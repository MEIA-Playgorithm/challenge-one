// Os campos de uma linha de CSV, como o Python os escreve na knowledge base: uma vírgula
// entre aspas não separa campos e "" dentro de aspas é uma aspa.
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
