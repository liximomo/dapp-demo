
import { setConfig } from "./config";
import config_0 from "./tokens/config.bsc-test";
import config_1 from "./apps/pancakeswap/config.bsc-test";

const config = {
"tokens": config_0,
"pancakeswap": config_1,
}

setConfig(config);

export default config;
