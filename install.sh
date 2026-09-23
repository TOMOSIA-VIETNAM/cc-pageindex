#!/usr/bin/env bash
# Install the skills in this repository for Claude Code, so they are available
# from any directory.
#
# Each directory under skills/ that holds a SKILL.md is linked into the
# personal skills directory. A link, not a copy: edits here take effect in the
# next session with nothing to reinstall. A skill with a requirements.txt also
# gets its own virtualenv at .venv, which its SKILL.md tells the agent to use.
#
#   ./install.sh              install or update every skill
#   ./install.sh --uninstall  remove the links (this repository is left alone)
#
# CLAUDE_CONFIG_DIR overrides where Claude Code keeps its configuration.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
skills_dir="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills"
uninstall=false

case "${1:-}" in
  --uninstall) uninstall=true ;;
  "") ;;
  *) echo "Usage: ${BASH_SOURCE[0]} [--uninstall]" >&2; exit 2 ;;
esac

shopt -s nullglob
found=false

for skill in "$here"/skills/*/; do
  [[ -f "$skill/SKILL.md" ]] || continue
  found=true
  skill="${skill%/}"
  name="$(basename "$skill")"
  link="$skills_dir/$name"

  if $uninstall; then
    if [[ -L "$link" ]]; then
      rm "$link"
      echo "Removed $link"
    elif [[ -e "$link" ]]; then
      echo "Left $link alone: it is a real directory, not a link to this repository." >&2
    else
      echo "Nothing installed at $link"
    fi
    continue
  fi

  if [[ -f "$skill/requirements.txt" ]]; then
    echo "==> $name: building the virtualenv"
    if command -v uv >/dev/null 2>&1; then
      uv venv "$skill/.venv" --python 3.12
      uv pip install --quiet --python "$skill/.venv/bin/python" \
        --upgrade -r "$skill/requirements.txt"
    else
      python3 -m venv "$skill/.venv"
      "$skill/.venv/bin/pip" install --quiet --upgrade pip
      "$skill/.venv/bin/pip" install --quiet --upgrade -r "$skill/requirements.txt"
    fi
  fi

  if [[ -e "$link" && ! -L "$link" ]]; then
    echo "A real directory already sits at $link. Move it aside first." >&2
    exit 1
  fi
  mkdir -p "$skills_dir"
  ln -sfn "$skill" "$link"
  echo "==> $name: installed at $link"
done

$found || { echo "No skills found under $here/skills" >&2; exit 1; }
$uninstall && exit 0

echo
echo "Start a Claude Code session in any directory and name the skill you want."
