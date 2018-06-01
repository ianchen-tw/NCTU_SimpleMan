import json
import sys


def main():
    f = sys.argv[1]
    with open(f, "r") as j:
        jload = json.load(j)
    with open(f, "w") as j:
        json.dump(jload,j,ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()