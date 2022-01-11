
import { setConfig } from "./config";
import config_0 from "./tokens/config.bsc";
import config_1 from "./apps/pancakeswap/config.bsc";

const config = {
"tokens": config_0,
"pancakeswap": config_1,
}

setConfig(config);

export default config;
