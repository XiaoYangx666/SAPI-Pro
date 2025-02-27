import os
import shutil
import zipfile

def zip_directory(source_dir, output_zip):
    """
    将目录压缩为 ZIP 文件。
    :param source_dir: 要压缩的目录
    :param output_zip: 输出的 ZIP 文件路径
    """
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(source_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, start=source_dir)
                zipf.write(file_path, arcname)

def create_dir(build_dir):
    """确保构建目录存在，并清理之前的内容"""
    if os.path.exists(build_dir):
        shutil.rmtree(build_dir)
    os.makedirs(build_dir)

def copy_files_except_exclusions(source_dir, dest_dir, exclusions):
    """
    复制目录中的文件到目标目录，排除某些文件和目录，且不覆盖目标目录中已存在的文件。
    :param source_dir: 源目录
    :param dest_dir: 目标目录
    :param exclusions: 排除的文件或目录列表
    """
    for item in os.listdir(source_dir):
        if item not in exclusions:
            src_path = os.path.join(source_dir, item)
            dest_path = os.path.join(dest_dir, item)

            if os.path.isdir(src_path):
                shutil.copytree(src_path, dest_path)
                print(f"已复制目录: {src_path} -> {dest_path}")
            else:
                shutil.copy2(src_path, dest_path)
                print(f"已复制文件: {src_path} -> {dest_path}")

def main():
    build_dir = "./build"
    create_dir(build_dir)

    os.remove("./scripts/main.d.ts")
    # 定义要打包的目录和输出文件名
    dirs_to_zip = [
        ("./src/SAPI-Pro", "SAPI-Pro_ts.zip"),
        ("./scripts/SAPI-Pro", "SAPI-Pro_js.zip")
    ]

    for src_dir, zip_name in dirs_to_zip:
        if os.path.exists(src_dir):
            zip_filename = os.path.join(build_dir, zip_name)
            zip_directory(src_dir, zip_filename)
            print(f"已压缩: {src_dir} -> {zip_filename}")

    # 复制当前目录（排除 template 和 build）到 template 文件夹
    current_dir = "."
    template_dir = "./template"
    exclude_dirs = {"template", "build", "build.py", "node_modules", "docs", "package-lock.json", "readme.md", "readme_en.md", ".gitignore", ".git"}  # 排除的目录

    # 合并 template 目录与其他文件到临时目录
    temp_root_dir = os.path.join(build_dir, "temp_root")
    os.makedirs(temp_root_dir)

    # 复制 template 目录内容到临时目录
    copy_files_except_exclusions(current_dir, temp_root_dir, exclude_dirs)
    if os.path.exists(template_dir):
        copy_files_except_exclusions(template_dir, temp_root_dir, {})
    else:
        print(f"错误：{template_dir} 目录不存在！")
        return

    # 压缩临时目录为 BasePack
    zip_filename = os.path.join(build_dir, "SAPI-Pro_BasePack.zip")
    zip_directory(temp_root_dir, zip_filename)
    print(f"已压缩: {temp_root_dir} -> {zip_filename}")

    # 清理临时目录
    shutil.rmtree(temp_root_dir)

    print("打包完成！输出目录：", build_dir)

if __name__ == "__main__":
    main()
