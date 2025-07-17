# Large File Handling Guide

## Git LFS is now configured for this repository

### Tracked File Types
The following file extensions are automatically handled by Git LFS:
- Videos: `*.mov`, `*.mp4`, `*.avi`, `*.mkv`, `*.webm`
- Documents: `*.pdf`, `*.docx`, `*.xlsx`
- Images: `*.png`, `*.jpg`, `*.jpeg`, `*.psd`, `*.ai`
- Audio: `*.mp3`, `*.m4a`, `*.flac`, `*.wav`
- Archives: `*.zip`, `*.tar.gz`, `*.tar.xz`, `*.dmg`, `*.pkg`, `*.deb`
- Databases: `*.db`, `*.sqlite`, `*.mbox`
- Other: `*.bin`, `*.exe`, `*.iso`, `*.app`, `*.sketch`, `*.fig`

### Configuration Applied
- Git buffer increased to 500MB
- Big file threshold set to 100MB
- Pack size limit set to 100MB

### How to Use
1. **Add files normally**: `git add yourfile.pdf`
2. **Commit as usual**: `git commit -m "Add large file"`
3. **Push to remote**: `git push origin main`

### Commands for Large Files
```bash
# Check which files are tracked by LFS
git lfs ls-files

# Track new file type
git lfs track "*.newext"

# See LFS status
git lfs status

# Pull LFS files
git lfs pull
```

### Troubleshooting
- If push fails, check GitHub LFS quota
- For files >2GB, consider alternative storage
- Run `git lfs migrate` to convert existing large files