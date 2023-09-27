type ConfigItem = ConfigMap | string | number | boolean | any[] | null;

type ConfigMap = {
    [key: string]: ConfigItem | string | number | boolean | any[] | null
}


export class Config {
    static instance: InstanceType<typeof Config>
    config: ConfigItem = {
        server: {
            port: 5568,
            hostname: "0.0.0.0"
        },
        compress: {
            gzip: {
                level: 3,
                enable: true,
                minSize: 512
            },
            deflate: {
                level: 3,
                enable: true,
                minSize: 512
            }
        }
    }

    // constructor() {
    constructor(config: ConfigItem) {
        this.config = config;
    }

    static get(key: string): ConfigItem {
        if (Config.instance) {
            return Config.instance.config[key] || null;
        }
        return null;
    }
}