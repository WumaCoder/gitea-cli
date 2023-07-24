const { giteaApi } = require('gitea-js');
const fetch = require('cross-fetch'); // You have to use a fetch compatible polyfill like cross-fetch for Node.JS
const { Command } = require('commander');
const fs = require('fs-extra')
const simpleGit = require('simple-git');


async function main() {
  const program = new Command();

  program
    .name('gitea-cli')
    .description('CLI tool by gitea.')
    .version('0.0.4');

  program.command('sync')
    .description('notify remote repository sync')
    .argument('<string>', 'gitea repository url')
    .option('-t, --token <string>', 'gitea token')
    .option('-o, --owner <string>', 'user or org name')
    .option('-r, --repo <string>', 'repo name')
    .action(async (str, options) => {
        console.log(`[sync]: ${str}`)
        const url = new URL(str)
        const api = giteaApi(url.origin, {
          token:  options.token, // generate one at https://gitea.example.com/user/settings/applications
          customFetch: fetch,
        });
        
        await api.repos.repoMirrorSync(options.owner, options.repo);
        
        console.log(`[sync]: ok`)
    });

  const originSub = program.command('origin')
  originSub
    .command('pull')
      .description('pull origin repo.')
      .argument('<string>', 'clone dir path')
      .option('-r, --repo <string>', 'git url')
      .option('-b, --branch <string>', 'git branch')
      .action(async (str, options) => {
        console.log(`[origin][pull]: ${str}`)
        fs.mkdirpSync(str);
        if(fs.existsSync(`${str}/.git`)){
          await simpleGit(str).checkout(options.branch).pull('origin', options.branch);
        }else{
          await simpleGit().clone(options.repo, str).checkout(options.branch).pull('origin', options.branch);
        }
        console.log(`[origin][pull]: ok`)
      });

  await program.parseAsync();
}

main().catch(console.error)

// example: node index.js sync http://localhost:3000/wumacoder/gitea-repo.git -t e6fe15f4685f4dba6be2004b4a768e598dfc973a -o wumacoder -r gitea-repo