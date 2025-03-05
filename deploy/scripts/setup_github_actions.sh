#!/bin/bash

#########################################################
#  setup_github_actions.sh
#
#  This script downloads and configures a GitHub Actions
#  runner for a single repository:
#  https://github.com/devshittu/session-management/
#########################################################

# Variables for repository and runner
REPO_URL="https://github.com/devshittu/session-management/"
REPO_NAME="session-management"
RUNNER_VERSION="2.319.1"
RUNNER_PKG="actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"
RUNNER_URL="https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/${RUNNER_PKG}"
RUNNER_DIR="$HOME/action-runners/$REPO_NAME"

# Create the runner directory if it doesn't exist
mkdir -p "$RUNNER_DIR"
cd "$RUNNER_DIR" || exit 1

# Download the runner package if not already downloaded
if [ ! -f "$RUNNER_PKG" ]; then
    echo "Downloading GitHub Actions Runner..."
    curl -o "$RUNNER_PKG" -L "$RUNNER_URL"
    # Optionally, validate the hash here if desired:
    # echo "<SHA256_HASH>  $RUNNER_PKG" | shasum -a 256 -c
fi

# Extract the runner package
echo "Extracting the runner package..."
tar xzf "$RUNNER_PKG"

#########################################################
#  Token Input Handling: Interactive and Non-Interactive
#########################################################
# Token Input Handling: Check Environment First, Then Prompt
if [ -n "$TOKEN" ]; then
    # Token provided via environment
    echo "Using TOKEN from environment."
else
    # Check if running in an interactive TTY
    if [ -t 0 ]; then
        # Interactive: prompt user for the token, hide input
        echo "Please enter the registration token for the repository '$REPO_NAME':"
        read -s -p "Token: " TOKEN
        echo
    else
        # Non-interactive: look for TOKEN in the environment
        if [ -z "$TOKEN" ]; then
            echo "Error: No TOKEN environment variable provided, and script not in an interactive shell."
            exit 1
        fi
        echo "Using TOKEN from environment (non-interactive)."
    fi
fi

# If TOKEN is still empty, abort
if [ -z "$TOKEN" ]; then
    echo "Error: Token not provided."
    exit 1
fi

# Configure the runner
echo "Configuring the GitHub Actions Runner for '$REPO_NAME'..."

./config.sh --unattended \
  --url "$REPO_URL" \
  --token "$TOKEN" \
  --name "$(hostname)-$REPO_NAME-runner" \
  --work "_work" \
  --labels "self-hosted,Linux,X64" \
  --replace

if [ $? -ne 0 ]; then
    echo "Runner configuration failed."
    exit 1
else
    echo "Runner configured successfully for '$REPO_NAME'."
fi

# Ask if the user wants to run the runner immediately (interactive only)
if [ -t 0 ]; then
    read -p "Do you want to run the runner now? (y/n): " run_now
    if [[ "$run_now" =~ ^[Yy]$ ]]; then
        ./run.sh &
        echo "Runner is running in the background."
    else
        echo "You can start the runner later by running ./run.sh in $RUNNER_DIR"
    fi
else
    echo "Non-interactive mode detected. Not starting the runner automatically."
fi

# Completion message
echo "GitHub Actions Runner setup is complete for repository '$REPO_NAME'."
exit 0
