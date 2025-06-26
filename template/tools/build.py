# 用来生成发布文件
from pathlib import Path
import shutil
import zipfile

# 修改打包名字
name='build'
# 启用zip打包，会将mcpack再次压缩，方便蓝奏云上传
enableZip=True

# 要打包的文件或目录
files=['scripts','manifest.json','animation_controllers','animations','biomes','blocks','entities','functions','items','loot_tables','pack_icon.png','recipes','spawn_rules','structures','texts','trading','feature_rules','features']

def copy_files(source_dir:Path, dest_dir:Path):
    """
    复制目录中的文件到目标目录
    :param source_dir: 源目录
    :param dest_dir: 目标目录
    """
    if not source_dir.exists():
        print(f"错误：源目录 {source_dir} 不存在！")
        return

    if source_dir.is_file():
        shutil.copy2(source_dir,dest_dir)
        print(f"已复制文件: {source_dir} -> {dest_dir}")
        return
    
    # 确保目标目录的父目录存在
    dest_dir.mkdir(parents=True, exist_ok=True)

    for item in source_dir.iterdir():
        dest_path = dest_dir /item.name
        if item.is_dir():
            shutil.copytree(item, dest_path)
            print(f"已复制目录: {item} -> {dest_path}")
        else:
            shutil.copy2(item, dest_path)
            print(f"已复制文件: {item} -> {dest_path}")

buildRoot=Path('build')
buildTemp=buildRoot/'temp'
# 清理temp
if buildTemp.exists():
    shutil.rmtree(buildTemp)
# 复制文件
buildTemp.mkdir(parents=True)
for path in files:
    file=Path(path)
    if file.exists():
        copy_files(file,buildTemp/file.name)
# 压缩与重命名
shutil.make_archive(buildRoot/name,'zip',buildRoot,"temp")
shutil.rmtree(buildTemp)
file = Path(buildRoot/f'{name}.zip')
new_file = file.with_suffix(".mcpack")
file.rename(new_file)
# 再次压缩
if enableZip:
    zip_file=Path(buildRoot/f'{name}.zip')
    with zipfile.ZipFile(file, mode='w', compression=zipfile.ZIP_DEFLATED) as zipf:
        zipf.write(zip_file, arcname=zip_file.name)  # arcname 设定压缩包内的文件名
print("打包完成")