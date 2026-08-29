export function suiteOnlyLayers(layers) {
  if (!Array.isArray(layers) || !layers.includes("dsh-wsr")
    || !layers.includes("dsh-wsr-execution") || !layers.includes("dsh-wsr-studio")) {
    throw new Error("CLEAN_PROFILE_SUITE_LAYERS_MISSING");
  }
  return layers.filter((name) => name !== "dsh-wsr-execution" && name !== "dsh-wsr-studio");
}

export function assertCompositionDump(dump, expectedIds) {
  for (const id of expectedIds) {
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    const count = [...dump.matchAll(new RegExp(`\\bid:\\s*['\"]?${escaped}['\"]?\\s*$`, "gmu"))].length;
    if (count !== 1) throw new Error(`CLEAN_PROFILE_ACTIVATION_COUNT: ${id}=${count}`);
  }
  if (/\bid:\s*['"]?wsr-suite['"]?\s*$/mu.test(dump)) throw new Error("CLEAN_PROFILE_SUITE_ACTIVATION_LEAKAGE");
}

export function commandFailureDetail({ stdout, stderr }) {
  return [stdout, stderr].map((value) => value?.trim()).filter(Boolean).join("\n");
}

export function localSuiteOverrides({ execution, studio }, version = "0.0.0-development") {
  return {
    [`dsh-wsr-execution@${version}`]: `file:${execution}`,
    [`dsh-wsr-studio@${version}`]: `file:${studio}`,
  };
}

export function localSuiteOverrideYaml(overrides) {
  const lines = ["overrides:"];
  for (const [name, value] of Object.entries(overrides).sort(([left], [right]) => left.localeCompare(right))) {
    lines.push(`  ${JSON.stringify(name)}: ${JSON.stringify(value)}`);
  }
  return `${lines.join("\n")}\n`;
}
