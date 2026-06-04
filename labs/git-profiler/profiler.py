import subprocess
import datetime
import collections
import sys
import os
import math
import argparse

# --- CONFIG & STYLING ---
class Style:
    CYAN = '\033[96m'
    MAGENTA = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'
    NEON_VIOLET = '\033[38;5;171m'
    NEON_ORANGE = '\033[38;5;214m'

# --- ASCII ART ASSETS ---
SCAN_BANNER = f"""
{Style.NEON_VIOLET}    ____  ____  ____  _____ __    ______ 
   / __ \/ __ \/ __ \/ ___// /   / ____/ 
  / /_/ / /_/ / / / /\__ \/ /   / __/    
 / ____/ _, _/ /_/ /___/ / /___/ /___    
/_/   /_/ |_|\____//____/_____/_____/ v5.0{Style.END}
"""

BIOHAZARD = [
    "      _.-'''''-._      ",
    "    .'  _     _  '.    ",
    "   /   (o)   (o)   \   ",
    "  |                 |  ",
    "  |  \           /  |  ",
    "   \  '.       .'  /   ",
    "    '.  '-----'  .'    ",
    "      '-._____.-'      "
]

# --- CORE LOGIC ---
def run_git(cmd, path="."):
    try:
        return subprocess.check_output(cmd, shell=True, cwd=path, stderr=subprocess.STDOUT).decode('utf-8', errors='ignore')
    except: return None

def deep_scan(path):
    # Get everything: author, date, subject, body, and stats
    raw = run_git('git log --pretty=format:"%at|%s|%b" --shortstat --name-only', path)
    if not raw: return []
    
    commits = []
    current = None
    for line in raw.split('\n'):
        if not line.strip(): continue
        if '|' in line and not line.startswith(' '):
            if current: commits.append(current)
            ts, subj, body = (line.split('|', 2) + ["", ""])[:3]
            current = {
                'ts': int(ts), 'date': datetime.datetime.fromtimestamp(int(ts)),
                'msg': (subj + " " + body).lower(), 'files': [], 'ins': 0, 'del': 0
            }
        elif 'file' in line and ('changed' in line or 'insertion' in line):
            parts = line.strip().split(',')
            for p in parts:
                if 'insertion' in p: current['ins'] = int(p.strip().split(' ')[0])
                if 'deletion' in p: current['del'] = int(p.strip().split(' ')[0])
        elif '.' in line: current['files'].append(line.strip())
    if current: commits.append(current)
    return commits

def get_stats(commits):
    if not commits: return None
    total = len(commits)
    
    # Vocabulary & Sentiment
    all_words = " ".join([c['msg'] for c in commits]).split()
    word_freq = collections.Counter([w for w in all_words if len(w) > 3]).most_common(5)
    
    # Velocity (Commits per week last 4 weeks)
    now = datetime.datetime.now()
    recent = [c for c in commits if (now - c['date']).days < 30]
    velocity = len(recent) / 4.0

    # Archetype Points
    night = len([c for c in commits if 0 <= c['date'].hour <= 5]) / total
    weekend = len([c for c in commits if c['date'].weekday() >= 5]) / total
    clean = len([c for c in commits if any(k in c['msg'] for k in ['refactor', 'fix', 'clean', 'style'])]) / total
    chaos = len([c for c in commits if len(c['msg'].split()[0]) < 4 or any(k in c['msg'] for k in ['wip', 'oops', 'test'])]) / total
    
    # Ranking Logic
    rank, r_color = "C-CLASS", Style.BLUE
    if total > 50 and clean > 0.3: rank, r_color = "S-TIER", Style.NEON_ORANGE
    elif total > 30: rank, r_color = "A-CLASS", Style.MAGENTA
    elif total > 10: rank, r_color = "B-CLASS", Style.CYAN

    return {
        'total': total, 'rank': rank, 'r_color': r_color,
        'night': night*100, 'weekend': weekend*100, 'clean': clean*100, 'chaos': chaos*100,
        'velocity': velocity, 'top_words': word_freq,
        'ins': sum(c['ins'] for c in commits), 'del': sum(c['del'] for c in commits),
        'streak': get_streak(commits)
    }

def get_streak(commits):
    dates = sorted(list(set([c['date'].date() for c in commits])))
    s = m = 0
    for i in range(len(dates)):
        if i > 0 and (dates[i] - dates[i-1]).days == 1: s += 1
        else: s = 1
        m = max(m, s)
    return m

def print_ui(s, path):
    print(SCAN_BANNER)
    print(f"{Style.BOLD}{Style.CYAN}TARGET:{Style.END} {os.path.abspath(path)}")
    print(f"{Style.BOLD}{Style.CYAN}STATUS:{Style.END} {Style.GREEN}ANALYSIS COMPLETE. DNA SEQUENCED.{Style.END}\n")

    # DNA Helix & Stats Column
    for i, line in enumerate(BIOHAZARD):
        color = [Style.NEON_VIOLET, Style.CYAN, Style.MAGENTA][i % 3]
        print(f"  {color}{line}{Style.END} ", end="")
        if i == 1: print(f" {Style.BOLD}RANK: {s['r_color']}[ {s['rank']} ]{Style.END}")
        elif i == 2: print(f" COMMITS: {Style.YELLOW}{s['total']}{Style.END}")
        elif i == 3: print(f" IMPACT:  {Style.GREEN}+{s['ins']}{Style.END} / {Style.RED}-{s['del']}{Style.END}")
        elif i == 4: print(f" VELOCITY: {Style.CYAN}{s['velocity']:.1f} commits/week{Style.END}")
        elif i == 5: print(f" STREAK:   {Style.MAGENTA}{s['streak']} days in the zone{Style.END}")
        else: print("")

    print(f"\n{Style.BOLD}🧬 DEVELOPER DNA {Style.END}")
    def bar(label, val, col):
        w = 30
        f = int(val/100*w)
        print(f"  {label:<15} {col}{'█'*f}{Style.END}{'░'*(w-f)} {val:>5.1f}%")
    
    bar("NIGHT OWL", s['night'], Style.BLUE)
    bar("WEEKEND", s['weekend'], Style.YELLOW)
    bar("CLEAN CODE", s['clean'], Style.GREEN)
    bar("CHAOS", s['chaos'], Style.RED)

    print(f"\n{Style.BOLD}🗣️ VOCABULARY CLOUD (TOP SLANG){Style.END}")
    words = [f"{Style.CYAN}{w}{Style.END}({c})" for w, c in s['top_words']]
    print(f"  {' • '.join(words)}")

    print(f"\n{Style.BOLD}{Style.NEON_ORANGE}🔗 SHARE YOUR DNA:{Style.END}")
    share = f"I'm a {s['rank']} Developer! DNA: {s['night']:.0f}% Night, {s['clean']:.0f}% Clean. Analyze your Git DNA with #GitProfiler v5.0!"
    print(f"  {Style.UNDERLINE}{share}{Style.END}")
    print("\n" + Style.NEON_VIOLET + "═"*60 + Style.END + "\n")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("path", nargs="?", default=".")
    args = parser.parse_args()
    
    data = deep_scan(args.path)
    if data:
        stats = get_stats(data)
        print_ui(stats, args.path)

if __name__ == "__main__":
    main()
