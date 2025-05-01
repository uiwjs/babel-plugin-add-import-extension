interface Options {
  /**
   * @default js
   * @description Appends the specified `.js` extension to `import` and `export` declarations.
   */
  extension?: string;
  /**
   * @default false
   * @description By default, if a declaration file already has an extension, it is preserved. Extensions are added to declaration files that do not have one.
   */
  replace?: boolean;
  /**
   * @default false
   * @description If set to `true` and a declaration file has an extension that is *not* included in the `observedScriptExtensions` list, the file will be skipped.
   */
  skipUnlistedExtensions?: boolean;
  /**
   * @default ['js', 'ts', 'jsx', 'tsx', 'mjs', 'cjs']
   * @description Declaration files with extensions present in this list are considered for extension replacement (based on the `replace` option). Files with extensions *not* in this list will have the `extension` option's value appended to them.
   */
  observedScriptExtensions?: [string];
}

export default function _default(code: string, options: Options): any;