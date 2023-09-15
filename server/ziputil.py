# 导入zipfile模块
import argparse
import zipfile
import os

# 定义一个函数，用来压缩一个文件或文件夹
def zip(sources, destination):
    # 创建一个ZipFile对象，以写入模式打开
    with zipfile.ZipFile(destination, 'w') as zf:
        # 判断源路径是文件还是文件夹
        for source in sources:
            entry_path = None
            if source[0] == ':':
                split = source[1:].split(':', maxsplit=1)
                entry_path = split[0]
                source = split[1]
            print(f'compress file:{source}{f" -> mapping:{entry_path}" if entry_path is not None else ""}')
            if os.path.isfile(source):
                # 如果是文件，直接添加到ZipFile对象中
                if entry_path is None:
                    entry_path = source
                zf.write(source, entry_path)
                print(f'compressed file:{source}')
            elif os.path.isdir(source):
                if entry_path is None:
                    entry_path = os.path.basename(os.path.abspath(source))
                # 如果是文件夹，遍历其下的所有文件和子文件夹
                for root, dirs, files in os.walk(source):
                    # 对于每个文件，添加到ZipFile对象中，保留相对路径
                    for file in files:
                        file_path = os.path.join(root, file)
                        zf.write(file_path, os.path.join(entry_path, os.path.relpath(file_path, source)))
                        print(f'compressed file:{file_path}')
            else:
                # 如果源路径不存在，抛出异常
                raise FileNotFoundError(f'{source} does not exist')
    # 关闭ZipFile对象
    zf.close()
    # 打印压缩成功的信息
    print(f'{source} has been zipped to {destination}')

# 定义一个函数，用来解压缩一个zip文件
def unzip(source, destination):
    # 创建一个ZipFile对象，以读取模式打开
    with zipfile.ZipFile(source, 'r') as zf:
        # 解压缩所有文件到目标路径
        zf.extractall(destination)
        zf.printdir()
    # 关闭ZipFile对象
    zf.close()
    # 打印解压缩成功的信息
    print(f'{source} has been unzipped to {destination}')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='zip util.')
    parser.add_argument('path', metavar='N', type=str, nargs='+',
                       help='source and target(Can be defaulted)')
    parser.add_argument('-u', '--unzip', action='store_true',
                        help='is unzip (zip source to target if not this option)')
    args = parser.parse_args()
    if args.unzip:
        unzip(args.path[0], args.path[1])
    else:
        zip(args.path[:-1], args.path[-1])