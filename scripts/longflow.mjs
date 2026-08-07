import { coverage, resumeContext, staleScan, validate } from "./longflow-core.mjs";

const commands = new Map([
  ["validate", validate],
  ["coverage", coverage],
  ["stale-scan", staleScan],
  ["resume-context", resumeContext]
]);

function usage(command, message) {
  return {
    command: command ?? null,
    ok: false,
    boundary: true,
    problems: [{ code: "usage", file: null, message }]
  };
}

function parse(argv) {
  const [command, ...args] = argv;
  if (!commands.has(command)) {
    return { error: usage(command, "Command must be validate, coverage, stale-scan, or resume-context.") };
  }

  let root = process.cwd();
  let tail;
  for (let index = 0; index < args.length; index += 1) {
    const option = args[index];
    const value = args[index + 1];
    if (option === "--root" && value !== undefined) {
      root = value;
      index += 1;
    } else if (option === "--tail" && value !== undefined && command === "resume-context" && /^\d+$/.test(value) && Number(value) > 0) {
      tail = Number(value);
      index += 1;
    } else {
      return { error: usage(command, `Invalid option for ${command}: ${option ?? "<missing>"}.`) };
    }
  }
  return { command, root, tail };
}

const parsed = parse(process.argv.slice(2));
const result = parsed.error ?? commands.get(parsed.command)(parsed.root, parsed.tail === undefined ? undefined : { tail: parsed.tail });
process.stdout.write(`${JSON.stringify(result)}\n`);
process.exitCode = result.boundary ? 2 : result.ok ? 0 : 1;
