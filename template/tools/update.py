import json
from pathlib import Path
import shutil
import urllib.request
import zipfile

source_github={
    "download":"https://github.com/XiaoYangx666/SAPI-Pro/releases/latest/download/SAPI-Pro_ts.zip",
    "package":"https://raw.githubusercontent.com/XiaoYangx666/SAPI-Pro/refs/heads/master/package.json",
    "manifest":"https://raw.githubusercontent.com/XiaoYangx666/SAPI-Pro/refs/heads/master/template/manifest.json"
}

source_gitee={
    "download":"https://gitee.com/ykxyx666_admin/SAPI-Pro/releases/download/latest/SAPI-Pro_ts.zip",
    "package":"https://gitee.com/ykxyx666_admin/SAPI-Pro/raw/master/package.json",
    "manifest":"https://gitee.com/ykxyx666_admin/SAPI-Pro/raw/master/template/manifest.json"
}


def update_dependencies(remote_package: dict):
    """
    根据远程 package.json 更新本地依赖
    """
    local_path = Path("package.json")
    if not local_path.exists():
        raise FileNotFoundError("本地 package.json 文件不存在")

    with local_path.open("r", encoding="utf-8") as f:
        local_data = json.load(f)

    local_data["dependencies"] |= remote_package.get("dependencies", {})
    local_data.setdefault("overrides", {}).setdefault("@minecraft/server-ui", {})["@minecraft/server"] = remote_package["dependencies"].get("@minecraft/server")

    with local_path.open("w", encoding="utf-8") as f:
        json.dump(local_data, f, ensure_ascii=False, indent=4)
    
    print("✅ 已更新 package.json 中依赖")

def update_manifest(remote_manifest: dict):
    """
    根据远程 manifest，仅更新已存在 module_name 的 version
    """
    local_path = Path("manifest.json")
    if not local_path.exists():
        raise FileNotFoundError("本地 manifest.json 文件不存在")

    with local_path.open("r", encoding="utf-8") as f:
        local_data = json.load(f)

    local_deps: list[dict] = local_data.get("dependencies", [])
    remote_deps: list[dict] = remote_manifest.get("dependencies", [])

    # 构建 remote 的快速查找表
    remote_version_map = {d["module_name"]: d["version"] for d in remote_deps}

    # 更新已有模块的版本
    updated_count = 0
    for dep in local_deps:
        name = dep.get("module_name")
        if name in remote_version_map:
            old_version = dep.get("version")
            new_version = remote_version_map[name]
            if old_version != new_version:
                dep["version"] = new_version
                updated_count += 1

    # 写回文件
    with local_path.open("w", encoding="utf-8") as f:
        json.dump(local_data, f, ensure_ascii=False, indent=4)
    
    print(f"✅ 已更新 manifest.json 中 {updated_count} 个依赖模块的版本")


def get_remote_data(source: dict[str, str]) -> dict[str, dict]:
    """
    从远程源获取 package.json 和 manifest.json 内容
    """
    try:
        with urllib.request.urlopen(source["package"]) as response:
            package_data = json.loads(response.read().decode())

        with urllib.request.urlopen(source["manifest"]) as response:
            manifest_data = json.loads(response.read().decode())

        return {"package": package_data, "manifest": manifest_data}

    except Exception as e:
        raise RuntimeError("❌ 获取远程版本失败，请检查网络或源地址") from e


def download_and_extract(url: str, target_path: str):
    """
    下载 zip 文件，解压到临时目录，拷贝内容到目标路径，清理临时文件
    """
    zip_path = Path(target_path).with_suffix(".zip")
    temp_path = Path("temp")

    print(f"⬇正在下载 SAPI-Pro 模板: {url}")
    urllib.request.urlretrieve(url, zip_path)

    # 清空临时目录
    if temp_path.exists():
        shutil.rmtree(temp_path)
    temp_path.mkdir(parents=True, exist_ok=True)

    # 解压缩
    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        zip_ref.extractall(temp_path)

    # 删除原有目标路径
    target = Path(target_path)
    if target.exists():
        shutil.rmtree(target)

    # 拷贝 temp 的内容到 target_path
    shutil.copytree(temp_path, target_path)

    # 清理
    shutil.rmtree(temp_path)
    zip_path.unlink()

    print(f"✅ 模板更新完成：{target_path}")





def main():
    print("=================更新SAPI-Pro=================")
    print("确认要更新 SAPI-Pro 吗？\n此操作将重写src/SAPI-Pro,manifest.json,package.json以支持最新版")
    ans = input("选择更新源或取消 [gitee/github/no] > ").strip().lower()
    if ans == "gitee":
        source = source_gitee
    elif ans == "github":
        source = source_github
    else:
        print("❎ 已取消更新")
        return

    try:
        data = get_remote_data(source)

        download_and_extract(source["download"], "./src/SAPI-Pro")
        update_dependencies(data["package"])
        update_manifest(data["manifest"])

        print("🎉 所有操作完成,请执行npm i更新依赖")
    except Exception as e:
        print(f"⚠️ 更新失败: {e}")


if __name__ == "__main__":
    main()