@echo off
set GIT="C:\Program Files\Git\cmd\git.exe"
%GIT% init
%GIT% config user.email "juniorolivergol@gmail.com"
%GIT% config user.name "Junior Soares"
%GIT% add .
%GIT% commit -m "feat: sistema de gincanas IASD Planalto - inicial"
echo.
echo === GIT INICIALIZADO COM SUCESSO! ===
