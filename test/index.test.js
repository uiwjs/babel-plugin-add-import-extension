import { transformSync } from '@babel/core';
import { join } from 'path';
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'fs';
import fs from 'fs';

import plugin, { isNodeModule } from '../src/index';

const defaultBabelOptions = {
  presets: [
    //['@babel/preset-env', { modules: false }],
  ],
  plugins: [],
};


const sourceCode = `import { add } from "./lib/numbers/";
function test() {
  return add(1, 2);
}
export default test;`;
const expectedCode = `import { add } from "./lib/numbers/index.js";
function test() {
  return add(1, 2);
}
export default test;`;

test(`Case '...' should work correctly`, () => {
  const babelOptions = {
    ...defaultBabelOptions,
    plugins: [
      [plugin, { extension: 'js' }]
    ]
  };
  const { code } = transformSync(sourceCode, babelOptions);
  expect(code).toBe(expectedCode);
})



const casesPath = join(__dirname, 'cases');
const dirEntries = readdirSync(casesPath, { withFileTypes: true });

for (const dirEntry of dirEntries) {
  // if (dirEntry.name !== 'assets') {
  //   continue;
  // }
  if (!dirEntry.isDirectory()) {
    continue;
  }

  const caseName = dirEntry.name;

  const optionsFilePath = join(casesPath, caseName, 'options.js');
  const inputFilePath = join(casesPath, caseName, 'input.js');
  const expectedOutputFilePath = join(casesPath, caseName, 'output.js');
  const resultFilePath = join(casesPath, caseName, 'received.js');

  test(`Case '${caseName}' should work correctly`, () => {
    const babelOptions = {
      ...defaultBabelOptions,
    };

    // Loading case-specific options
    if (existsSync(optionsFilePath)) {
      const caseOptionsModule = require(optionsFilePath);
      const caseOptions = (caseOptionsModule.default || caseOptionsModule);

      Object.assign(babelOptions, caseOptions.babelOptions || {});
      babelOptions.plugins = [
        ...babelOptions.plugins,
        [plugin, (caseOptions.pluginOptions || {})]
      ];
    }

    const source = readFileSync(inputFilePath, { encoding: 'utf-8' });
    const { code } = transformSync(source, babelOptions);

    writeFileSync(resultFilePath, code);

    const expectedCode = readFileSync(expectedOutputFilePath, {
      encoding: 'utf-8',
    });

    expect(code).toBe(expectedCode);

  });
}

describe('isNodeModule', () => {
  // 测试相对路径
  test('should return false for relative paths', () => {
    expect(isNodeModule('./local/file')).toBe(false);
    expect(isNodeModule('../another/file')).toBe(false);
    expect(isNodeModule('.')).toBe(false);
    expect(isNodeModule('..')).toBe(false);
  });
  // 测试绝对路径
  test('should return false for absolute paths', () => {
    expect(isNodeModule('/usr/local/lib/node_modules/some-module')).toBe(false);
  });

  // 测试核心 Node.js 模块
  test('should return true for core Node.js modules', () => {
    expect(isNodeModule('path')).toBe(true);
    expect(isNodeModule('fs')).toBe(true);
    expect(isNodeModule('http')).toBe(true);
  });
  // 测试已安装的 npm 包 (假设 react 已安装)
  test('should return true for installed npm packages (assuming react is installed)', () => {
    try {
      require.resolve('react'); // 检查 react 是否真的已安装
      expect(isNodeModule('react')).toBe(true);
    } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND') {
        //console.warn('react is not installed, skipping this test.');
      } else {
        throw e;
      }
    }
  });

  // 测试未安装的 npm 包
  test('should return false for non-installed npm packages', () => {
    expect(isNodeModule('this-package-does-not-exist')).toBe(false);
  });

  // 测试包含作用域的 npm 包 (假设 @babel/core 已安装)
  test('should return true for scoped npm packages (assuming @babel/core is installed)', () => {
    try {
      require.resolve('@babel/core'); // 检查 @babel/core 是否真的已安装
      expect(isNodeModule('@babel/core')).toBe(true);
    } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND') {
        console.warn('@babel/core is not installed, skipping this test.');
      } else {
        throw e;
      }
    }
  });

});