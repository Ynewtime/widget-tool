import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import http from 'node:http'
import handler from 'serve-handler'
import { createHttpTerminator } from 'http-terminator'

export const getCurrentPath = () => path.dirname(fileURLToPath(import.meta.url))

export function getPackageJson() {
  const packageJsonPath = path.resolve(getCurrentPath(), '../package.json')
  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
}

export const formatDir = (dir) => (dir === '.' ? `current path(${dir})` : dir)

export function serveDir(dir, port, watch) {
  const { name, version } = getPackageJson()

  const server = http.createServer((request, response) => {
    // You pass two more arguments for config and middleware
    // More details here: https://github.com/vercel/serve-handler#options
    return handler(request, response, {
      public: dir,
      headers: [
        {
          source: '**/*',
          headers: [
            {
              key: 'Access-Control-Allow-Origin',
              value: '*',
            },
          ],
        },
      ],
    })
  })
  server.listen(port, () => {
    console.log(`///////// ${name} ${version} /////////`)
    console.log(`Widget path: ${formatDir(dir)}`)
    console.log(`${watch ? 'Watching' : 'Running'} at http://localhost:${port}`)

    if (!fs.existsSync(path.join(dir, 'packageinfo.json'))) {
      console.warn(`WARNING: This directory seems not having a packageinfo.json file, this might be an error because appcube widget requires one.`)
    }
  })
  const httpTerminator = createHttpTerminator({ server })
  const close = async () => await httpTerminator.terminate()

  return close
}
