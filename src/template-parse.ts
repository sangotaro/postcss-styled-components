import type { ProcessOptions } from "postcss";
import Input from "postcss/lib/input";
import Root from "postcss/lib/root";

import { TemplateParser } from "./template-parser";

export function templateParse(
  css: string,
  opts: Pick<ProcessOptions, "map" | "from">
): Root {
  const input = new Input(css, opts);

  // @ts-expect-error TS2339: Property 'quasis' does not exist on type 'Input'.
  input.quasis = opts.quasis;
  // @ts-expect-error TS2339: Property 'templateLiteralStyles' does not exist on type 'Input'.
  input.templateLiteralStyles = opts.templateLiteralStyles;
  // @ts-expect-error TS2339: Property 'parseOptions' does not exist on type 'Input'.
  input.parseOptions = opts;
  // @ts-expect-error TS2554: Expected 0 arguments, but got 1
  const parser = new TemplateParser(input);

  // @ts-expect-error  TS2339: Property 'parse' does not exist on type 'TemplateParser'.
  parser.parse();

  // @ts-expect-error TS2339: Property 'root' does not exist on type 'TemplateParser'.
  return parser.root;
}
