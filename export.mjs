import fs from "fs";

const file = fs.readFileSync("index.js", "utf8");

const scriptable = {
  always_run_in_app: false,
  icon: {
    color: "deep-blue",
    glyph: "chart-line",
  },
  name: "Scriptable GMX",
  script: file,
  share_sheet_inputs: [],
};

fs.writeFileSync(
  "Scriptable GMX.scriptable",
  JSON.stringify(scriptable, null, 2)
);
