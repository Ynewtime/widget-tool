#!/usr/bin/env node

import fs from 'node:fs'
import chokidar from 'chokidar'
import { Command } from 'commander'
import { getPackageJson, formatDir, serveDir } from './utils.mjs'

///////// CONFIGURATION /////////
const PORT = 3000
const DIR = '.'
const { name, description, version } = getPackageJson()
///////// CONFIGURATION /////////

const program = new Command()
program.name(name).description(description).version(version)
program.option('-p, --port <port>', `listening port, default is ${PORT}`)
program.option('-d, --dir <dir>', `appcube widget directory path, default is ${formatDir(DIR)}`)
program.option('-w, --watch', `watch file change in the widget dir`)
program.parse()
const { args } = program
const { dir = args.length ? args[0] : DIR, port = PORT, watch } = program.opts()

if (!fs.existsSync(dir)) throw Error(`Path ${dir} not exist.`)
else if (watch) {
  let close = serveDir(dir, port, watch)
  chokidar.watch(dir).on('change', async () => {
    if (close) await close()
    close = serveDir(dir, port, watch)
  })
} else serveDir(dir, port)
