# Getting Started with Visual Studio Code Insiders and Git

This guide will help you install Visual Studio Code Insiders, clone the DrAlex repository to your local machine, create a new branch, and push your changes.

## 1. Install Visual Studio Code Insiders

1. Go to the [VS Code Insiders download page](https://code.visualstudio.com/insiders/).
2. Download the installer for your operating system (Windows, macOS, or Linux).
3. Run the installer and follow the prompts to complete installation.
4. Launch Visual Studio Code Insiders from your applications menu or desktop shortcut.

## 2. Clone the DrAlex Repository Locally

1. Open Visual Studio Code Insiders.
2. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac).
3. Type `Git: Clone` and select it.
4. Enter the repository URL:
   `https://github.com/CieloVistaSoftware/DrAlex.git`
5. Choose a local folder to clone the repository into.
6. VS Code will prompt you to open the cloned folder—click "Open".

Alternatively, you can use the terminal:

```sh
git clone https://github.com/CieloVistaSoftware/DrAlex.git
```

## 3. Create a New Branch

1. Open the built-in terminal in VS Code (`Ctrl+`` or `Cmd+`` on Mac).
2. Run the following command, replacing `feature/my-branch` with your branch name:
```sh
git checkout -b feature/my-branch
```

## 4. Push Changes to Your Branch

1. Stage your changes:
```sh
git add .
```
2. Commit your changes:
```sh
git commit -m "Describe your changes here"
```
3. Push your branch to the remote repository:
```sh
git push -u origin feature/my-branch
```

## 5. Verify and Create a Pull Request

- Go to your repository on GitHub.
- You will see an option to create a pull request for your branch.
- Follow the prompts to open a pull request and submit your changes for review.

---
**Tip:** You can use the Source Control panel in VS Code for most Git operations with a graphical interface.
