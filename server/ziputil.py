import argparse
import zipfile
import os

def zip(sources, destination):
    with zipfile.ZipFile(destination, 'w') as zf:
        for source in sources:
            entry_path = None
            if source[0] == ':':
                split = source[1:].split(':', 1)
                entry_path = split[0]
                source = split[1]
            out = 'compress file:' + source
            if entry_path is not None:
                out += ' -> mapping:' + entry_path
            print(out)
            if os.path.isfile(source):
                if entry_path is None:
                    entry_path = source
                zf.write(source, entry_path, compress_type=zipfile.ZIP_DEFLATED)
                print('compressed file:' + source)
            elif os.path.isdir(source):
                if entry_path is None:
                    entry_path = os.path.basename(os.path.abspath(source))
                for root, dirs, files in os.walk(source):
                    for file in files:
                        file_path = os.path.join(root, file)
                        zf.write(file_path, os.path.join(entry_path, os.path.relpath(file_path, source)), compress_type=zipfile.ZIP_DEFLATED)
            else:
                print('WARN: target does not exist: ' + source)
    zf.close()
    print(source + ' has been zipped to ' + destination)

def unzip(source, destination):
    with zipfile.ZipFile(source, 'r') as zf:
        zf.extractall(destination)
        zf.printdir()
    zf.close()
    print(source + ' has been unzipped to ' + destination)

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