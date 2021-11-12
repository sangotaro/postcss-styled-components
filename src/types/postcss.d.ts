import "postcss";

module "postcss" {
  export interface Source {
    inline: boolean;
    lang: string;
    syntax: Syntax;
  }
}
