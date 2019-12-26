import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import sourceMaps from 'rollup-plugin-sourcemaps'
import JsonPlugin from 'rollup-plugin-json';
import { terser } from 'rollup-plugin-terser';
import os from 'os';
import path from 'path';
const cpuNums = os.cpus().length;
const json = require('../package.json')
const resolveFile = function(filePath) {
    return path.join(__dirname, '..', filePath)
}
const isProduction = process.env.NODE_ENV === 'production';

export default {
    input: resolveFile('src/index.ts'),
    output: [{
            file: json.main,
            format: 'umd',
            name: 'wrapperWebSocket',
            sourcemap: true,
            globals: {
                'stompjs': 'stompjs',
                'sockjs-client': 'sockjsClient',
            },
        },
        {
            file: json.module,
            format: 'es',
            name: 'wrapperWebSocket',
            sourcemap: true
        },
    ],
    external: [
        "stompjs",
        "sockjs-client",
    ],
    plugins: [
        resolve(),
        commonjs(),
        JsonPlugin(),
        typescript({
            useTsconfigDeclarationDir: true,
            clean: true,
            abortOnError: true
        }),
        sourceMaps(),
        isProduction && terser({
            output: {
                comments: false,
            },
            numWorkers: cpuNums, //多线程压缩
            sourcemap: true,
            exclude: ['node_modules/**']
        })
    ]
}