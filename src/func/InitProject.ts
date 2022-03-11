import { utils } from "../../src/utils";

export namespace InitProject {

    let folders = ['/client', '/server', '/策划/配置', '/美术', '/运营']

    export let projectPathConfig: any = {
        excelsDir: '/策划/配置',
        jsonOutputConfigFile: '/json_export_config.jsonc'
    };

    export function init(c: any) {
        let root = c.root;
        folders.forEach(path => {
            utils.makeDir(root + path);
        });
        utils.copy(process.cwd() + projectPathConfig.jsonOutputConfigFile, root + projectPathConfig.jsonOutputConfigFile);
    }
}