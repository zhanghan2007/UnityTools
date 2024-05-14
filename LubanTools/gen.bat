set WORKSPACE=..
set LUBAN_DLL=%WORKSPACE%\Tools\Luban\Luban.dll
set CONF_ROOT=.

dotnet %LUBAN_DLL% ^
    -t all ^
	-c cs-bin ^
    -d bin ^
    --conf %WORKSPACE%\MiniTemplate\luban.conf ^
	-x outputCodeDir=%WORKSPACE%\..\..\Assets\Scripts\Configs\Gen ^
    -x outputDataDir=%WORKSPACE%\..\..\Assets\Games_AssetBundle\Configs\

dotnet %LUBAN_DLL% ^
    -t all ^
    -d json ^
    --conf %WORKSPACE%\MiniTemplate\luban.conf ^
    -x outputDataDir=output
pause