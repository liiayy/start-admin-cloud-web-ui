import fs from 'node:fs'
import path from 'node:path'

const viewsDir = 'f:/project-java/start-admin-cloud/start-admin-web-ui-new/apps/example/src/views/system'

function getFiles(dir) {
  let results = []
  const list = fs.readdirSync(dir)
  list.forEach((file) => {
    file = path.join(dir, file)
    const stat = fs.statSync(file)
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file))
    }
    else if (file.endsWith('.vue') || file.endsWith('.ts')) {
      results.push(file)
    }
  })
  return results
}

const files = getFiles(viewsDir)

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8')

  // 1. Remove route block
  content = content.replace(/<route lang="yaml">[\s\S]*?<\/route>\n?/g, '')

  // 2. Fix imports
  content = content.replace(/import \{ toast \} from 'vue-sonner'\n?/g, '')
  content = content.replace(/import \{ useDict \} from '@\/hooks\/useDict\.ts'/g, 'import { useDict } from \'@/composables/useDict.ts\'')
  content = content.replace(/import \{ useTable \} from '@\/hooks\/useTable\.ts'/g, 'import { useTable } from \'@/composables/useTable.ts\'')
  content = content.replace(/import \{ useFaModal \} from '@\/ui\/components\/FaModal'\n?/g, '')
  content = content.replace(/import \{ useUserStore \} from '@\/store\/modules\/user\.ts'\n?/g, '')
  content = content.replace(/import \{ useSettingsStore \} from '@\/store\/modules\/settings\.ts'\n?/g, '')

  // 3. Fix usage
  content = content.replace(/toast\.success\(/g, 'faToast.success(')
  content = content.replace(/toast\.error\(/g, 'faToast.error(')
  content = content.replace(/toast\.warning\(/g, 'faToast.warning(')
  content = content.replace(/useUserStore\(\)/g, 'useAppAccountStore()')
  content = content.replace(/useSettingsStore\(\)/g, 'useAppSettingsStore()')

  fs.writeFileSync(file, content, 'utf8')
  console.log(`Fixed: ${file}`)
})
