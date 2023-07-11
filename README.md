# vscode-rspec-outline

rspecのアウトラインを表示する拡張機能です。
**_spec.rbファイルのみ機能します。

![screenshot](image/screenshot.png)

## 本拡張機能の目的

長いテストファイルにて、どんなテストを書いているか把握するために使用されることを想定しています。そのため、シングルクォートで囲われている、一部のシンプルなブロックのみアウトラインに表示しています。

## インストール方法

1. Releasesから最新のvsixファイルをダウンロード
2. 以下の手順を参考に、vsixファイルをVSCodeにインストール  
https://learn.microsoft.com/ja-jp/visualstudio/ide/finding-and-using-visual-studio-extensions?view=vs-2022#install-without-using-the-manage-extensions-dialog-box

## 使い方

1. VSCodeの［View - Open View］から［Outline］を選択。  
Outline View が表示される。
2. VSCodeのExplorerで「*spec.rb」ファイルを開く。  
Outline View に現在編集中ファイルのアウトラインが表示される。

## 表示対応ブロック

以下のブロックのみ、アウトラインに表示します。

|ブロック|表示形式|
|---|---|
|describe|Namespace|
|context|Event|
|include_context|Event|
|it|Method|
|it_behaves_like|Method|
|shared_examples|Module|
|shared_examples_for|Module|
|shared_context|Module|
