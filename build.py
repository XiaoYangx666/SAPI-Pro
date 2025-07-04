from pathlib import Path
import shutil
import zipfile
import subprocess
import argparse
import os
import json

def zip_directory(source_dir, output_zip):
    """
    将目录压缩为 ZIP 文件。
    :param source_dir: 要压缩的目录
    :param output_zip: 输出的 ZIP 文件路径
    """
    source_dir = Path(source_dir)
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for file_path in source_dir.rglob('*'):
            if file_path.is_file():
                arcname = file_path.relative_to(source_dir)
                zipf.write(file_path, arcname)

def create_dir(build_dir):
    """确保构建目录存在，并清理之前的内容"""
    build_dir = Path(build_dir)
    if build_dir.exists():
        shutil.rmtree(build_dir)
    build_dir.mkdir(parents=True)

def copy_files(source_dir:Path, dest_dir:Path):
    """
    复制目录中的文件到目标目录
    :param source_dir: 源目录
    :param dest_dir: 目标目录
    """
    
    if not source_dir.exists():
        print(f"错误：源目录 {source_dir} 不存在！")
        return
    
    # 确保目标目录的父目录存在
    dest_dir.mkdir(parents=True, exist_ok=True)
    
    for item in source_dir.iterdir():
        dest_path = dest_dir / item.name
        if item.is_dir():
            shutil.copytree(item, dest_path)
            print(f"已复制目录: {item} -> {dest_path}")
        else:
            shutil.copy2(item, dest_path)
            print(f"已复制文件: {item} -> {dest_path}")

def updateDependencies(template_dir:Path):
    """
    更新模板中的依赖版本，manifest需要手动更新
    template_dir:模板路径
    """
    packageJson_dir=Path("package.json")
    if(not packageJson_dir.exists() or not template_dir.exists()):
        raise FileNotFoundError("package.json文件不存在")
    
    with open(packageJson_dir,'r',encoding='utf8') as f:
        data=json.load(f)
        dependencies=data['dependencies']
    with open(template_dir/'package.json',mode='r') as f:
        template=json.load(f)
        template['dependencies']=dependencies
        template['overrides']['@minecraft/server-ui']['@minecraft/server']=dependencies['@minecraft/server']
    with open(template_dir/'package.json',mode='w') as f:
        json.dump(template,f,ensure_ascii=False,indent=4)
        

def main():
    # 获取参数
    parser = argparse.ArgumentParser()
    parser.add_argument('--declaration', type=str,default='true')
    args = parser.parse_args()
    build_dir = Path("./build")
    scripts_dir = Path("./scripts")
    create_dir(build_dir)
    create_dir(scripts_dir)
    # 编译
    print("开始编译")
    result = subprocess.Popen(["tsc","--declaration",args.declaration],shell=os.name=="nt")
    result.wait()
    print("编译完成")

    
    # 打包ts和js文件
    dirs_to_zip = [
        ("./src", "SAPI-Pro_ts.zip"),
        ("./scripts", "SAPI-Pro_js.zip")
    ]

    for src_dir, zip_name in dirs_to_zip:
        src_dir = Path(src_dir)
        if src_dir.exists():
            zip_filename = build_dir / zip_name
            zip_directory(src_dir, zip_filename)
            print(f"已压缩: {src_dir} -> {zip_filename}")
        else:
            print(f"警告：目录 {src_dir} 不存在，跳过压缩。")
    
    # 定义目录
    # template_dir = Path("./template")
    # temp_root_dir = build_dir / "temp_root"
    # temp_root_dir.mkdir(parents=True, exist_ok=True)

    # # 复制 src 和 scripts 目录内容到临时目录
    # copy_files(Path("./src"), temp_root_dir / "src")
    # copy_files(Path("./scripts"), temp_root_dir / "scripts")
    
    # # 复制template目录
    # if template_dir.exists():
    #     updateDependencies(template_dir)
    #     copy_files(template_dir, temp_root_dir)
    # else:
    #     print(f"错误：{template_dir} 目录不存在！")
    #     return

    # # 压缩临时目录为 BasePack
    # zip_filename = build_dir / "SAPI-Pro_BasePack.zip"
    # zip_directory(temp_root_dir, zip_filename)
    # print(f"已压缩: {temp_root_dir} -> {zip_filename}")

    # # 清理临时目录
    # shutil.rmtree(temp_root_dir)

    print("打包完成！输出目录：", build_dir)

if __name__ == "__main__":
    main()