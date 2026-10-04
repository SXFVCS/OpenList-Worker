/**
 * OpenList-Worker · husky 钩子安装（从 package.json 的 prepare 里搬出来）
 *
 * 原因：
 *   Cloudflare dashboard 的「Deploy to Cloudflare / Clone a repository」向导会把
 *   package.json 原样 POST 到 /api/v4/workers/template-from-worker。请求体里出现
 *   require("child_process").execSync(...) 会被 Cloudflare WAF 判定为命令注入，
 *   返回 403 + HTML 拦截页；dashboard 解析不了这个响应，于是统一显示成
 *   「There was a problem parsing the Wrangler configuration file」——
 *   把锅甩给了 wrangler.jsonc（那份文件其实一直是好的）。
 *
 *   证据（HAR 抓包级）：https://github.com/lotus-infosec/cpe-pct/pull/13
 *
 * 行为与原 package.json 里的 prepare 脚本完全一致：
 *   只在存在 .git 时安装 husky 钩子；失败静默忽略，不阻断 install/build/deploy。
 *
 * 注意：本文件不会被上传到那个接口（上传统只有 package.json 与 wrangler.jsonc），
 *       所以这里出现 child_process 是安全的。
 */
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";

if (existsSync(".git")) {
  try {
    execSync("husky", { stdio: "ignore" });
  } catch {
    // 装不上钩子不影响使用，静默忽略（与原脚本一致）
  }
}
