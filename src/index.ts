import fs from 'promise-fs';
import path from 'path';
import os from 'os';

type Key = {
  name: string,
  contents: string,
}

type Parameters = {
  key?: string,
  keys?: Array<Key>,
  known_hosts?: string | Array<string>,
  config?: string,
}

type Event = {
  parameters: Parameters
}

type File = {
  name: string,
  contents: string,
  options: fs.WriteFileOptions
}

export async function run(event: Event) {
  const homeEnv = process.platform === "win32" ? "USERPROFILE" : "HOME";
  const home = process.env[homeEnv]
  if (home === undefined) {
    return new Error(`${homeEnv} is not defined`)
  }
  const dir = path.resolve(home, ".ssh")
  try {
    if (!fs.existsSync(dir)) {
      // Create ssh directory
      await fs.mkdir(dir, { recursive: true, mode: 0o700 })
    }
    // Prepare files to store under .ssh directory
    const files = prepareFiles(event.parameters)
    // Save files.
    for (const file of files) {
      const filepath = path.join(dir, file.name)
      console.log(`Writing file ${filepath}`)
      await fs.writeFile(filepath, file.contents, file.options);
    }
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }
}

// prepareFiles build an array of files to be stored in .ssh
// directory.
const prepareFiles = (params: Parameters) => <File[]>([
  params.key ? {
    name: 'default',
    contents: params.key,
    options: {
      mode: 0o400,
      flag: 'ax',
    }
  } : undefined,
  ...(params.keys ? [
    // Prepare ssh keys.
    ...params.keys.map(key => ({
      ...key,
      options: {
        mode: 0o400,
        flag: 'ax',
      }
    })),
  ] : []),
  // Prepare .ssh/known_hosts
  // Known hosts can be string or array of strings.
  params.known_hosts ? {
    name: "known_hosts",
    contents: Array.isArray(params.known_hosts)
      ? params.known_hosts.join(os.EOL)
      : params.known_hosts,
    options: {
      mode: 0o644,
      flag: "a",
    },
  } : undefined,
  // Prepare .ssh/config
  params.config ? {
    name: "config",
    contents: params.config,
    options: {
      mode: 0o644,
      flag: "a",
    },
  } : undefined,
].filter(Boolean))