# Using electron-owa with the native SMIME plugin provided by Microsoft

Due to legal issues, I am not allowed to package the required .NET dlls with this repository.

To install the required files, follow these steps:
1. Open your OWA site in IE or Firefox (it does not work in Chrome)
2. Find a message that is either signed or encrypted
3. Click the "not supported" link to open a popup
4. Download owasmime.msi from the displayed link
5. Install
6. Copy the three dll files from `%LOCALAPPDATA%\SmimeAX` to this directory (electron-owa/inject/lib)

You only have to do this once on a Windows PC! Afterwards, you can use electron-owa on all
supported platforms, and even copy the files to your colleagues or friends.
