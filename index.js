const { giteaApi } = require('gitea-js');
const fetch = require('cross-fetch'); // You have to use a fetch compatible polyfill like cross-fetch for Node.JS
const { Command } = require('commander');

async function main() {
  const program = new Command();

  program
    .name('gitea-cli')
    .description('CLI tool by gitea.')
    .version('0.0.1');

  program.command('sync')
    .description('notify remote repository sync')
    .argument('<string>', 'gitea repository url')
    .option('-t, --token <string>', 'gitea token')
    .option('-o, --owner <string>', 'user or org name')
    .option('-r, --repo <string>', 'repo name')
    .action((str, options) => {
      (async ()=>{
        console.log(`[sync]: ${str}`)
        const url = new URL(str)
        const api = giteaApi(url.origin, {
          token:  options.token, // generate one at https://gitea.example.com/user/settings/applications
          customFetch: fetch,
        });
        
        await api.repos.repoMirrorSync(options.owner, options.repo);
        
        console.log(`[sync]: ok`)
      })().catch(console.error)
    });

  await program.parse();
}

main().catch(console.error)

// example: node index.js sync http://localhost:3000/wumacoder/gitea-repo.git -t e6fe15f4685f4dba6be2004b4a768e598dfc973a -o wumacoder -r gitea-repo