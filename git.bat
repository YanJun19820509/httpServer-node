@echo off
REM 进入目标目录
cd %1

REM 打印当前参数
echo 正在进入目录 %1
echo 将要git pull来自远程origin的代码
git pull origin

REM 下面的行被注释掉, 如果需要重置到特定分支可以去掉前面的 REM
@REM git reset --hard origin/%2

REM 添加更改至暂存区并提交
echo 正在添加文件...
git add -A
echo 正在提交更改: %3 %4 %5 %6 %7 %8 %9
git commit -m "配置更新"

REM 输出将要push到哪个分支
echo push到远程分支: %2
git push origin %2

echo 操作完成.