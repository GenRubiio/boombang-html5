const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

// Set the path to the ffmpeg binary
ffmpeg.setFfmpegPath(ffmpegPath);

class AnimatedWebPMaker {
    constructor() {
        this.config = {
            frameRange: { from: 1, to: null }, // Set to null to process all frames by default
            delayTime: 5, // in 1/100 of second (5 = 20fps)
            loopCount: 0, // 0 = loop forever
            effects: {
                crossfadeFrames: false,
                dontStackFrames: true, // Remove frame when it's time to display next one
                useFirstFrameAsBackground: false
            },
            outputQuality: 100
        };
        this.objectsDir = path.join(__dirname, 'objects');
        this.outputDir = path.join(__dirname, 'output');
    }

    async ensureOutputDir() {
        await fs.ensureDir(this.outputDir);
    }

    async getAnimationFolders() {
        const items = await fs.readdir(this.objectsDir);
        const folders = [];
        
        for (const item of items) {
            const itemPath = path.join(this.objectsDir, item);
            const stat = await fs.stat(itemPath);
            if (stat.isDirectory()) {
                folders.push(item);
            }
        }
        
        return folders;
    }

    async getFrameFiles(animationFolder) {
        const folderPath = path.join(this.objectsDir, animationFolder);
        const files = await fs.readdir(folderPath);
        
        // Filter and sort PNG files numerically
        const pngFiles = files
            .filter(file => file.toLowerCase().endsWith('.png'))
            .map(file => {
                const num = parseInt(file.replace(/\D/g, ''));
                return { name: file, num: isNaN(num) ? 0 : num };
            })
            .sort((a, b) => a.num - b.num)
            .map(item => item.name);
            
        return pngFiles;
    }

    async createAnimatedWebP(animationFolder, customConfig = {}) {
        const config = { ...this.config, ...customConfig };
        console.log(`\n🎬 Processing animation: ${animationFolder}`);
        
        const frameFiles = await this.getFrameFiles(animationFolder);
        console.log(`📁 Found ${frameFiles.length} frames`);
        
        if (frameFiles.length === 0) {
            console.log(`❌ No PNG files found in ${animationFolder}`);
            return;
        }

        // Determine frame range
        const maxFrames = frameFiles.length;
        const fromFrame = Math.max(1, Math.min(config.frameRange.from, maxFrames));
        const toFrame = Math.max(fromFrame, Math.min(config.frameRange.to || maxFrames, maxFrames));
        
        console.log(`🎯 Using frames ${fromFrame} to ${toFrame} (of ${maxFrames} total)`);
        
        // Select frames to use
        const selectedFrames = frameFiles.slice(fromFrame - 1, toFrame);
        
        // Create a temporary directory for ffmpeg
        const tempDir = path.join(__dirname, 'temp', animationFolder);
        await fs.ensureDir(tempDir);

        // Copy and rename frames for ffmpeg
        console.log('🗂️ Preparing frames for FFmpeg...');
        for (let i = 0; i < selectedFrames.length; i++) {
            const frameFile = selectedFrames[i];
            const sourcePath = path.join(this.objectsDir, animationFolder, frameFile);
            const destPath = path.join(tempDir, `frame-${String(i).padStart(4, '0')}.png`);
            await fs.copy(sourcePath, destPath);
        }

        const outputPath = path.join(this.outputDir, `${animationFolder}.webm`);
        console.log(`💾 Creating animated WebM: ${outputPath}`);

        try {
            await new Promise((resolve, reject) => {
                const frameRate = 100 / config.delayTime;

                ffmpeg(path.join(tempDir, 'frame-%04d.png'))
                    .inputFPS(frameRate)
                    .outputOptions([
                        '-c:v libvpx-vp9',
                        '-pix_fmt yuva420p',
                        '-crf 0',
                        '-b:v 0',
                        '-lossless 1',
                        '-an',
                        '-f webm'
                    ])
                    .save(outputPath)
                    .on('end', resolve)
                    .on('error', reject);
            });

            console.log(`✅ Successfully created: ${animationFolder}.webm`);
            console.log(`   - Frames: ${selectedFrames.length}`);
            console.log(`   - Delay: ${config.delayTime}/100s (${Math.round(100 / config.delayTime)}fps)`);
            console.log(`   - Quality: ${config.outputQuality}%`);
            console.log(`   - Loop: ${config.loopCount === 0 ? 'Forever' : config.loopCount + ' times'}`);

        } catch (error) {
            console.error(`❌ Error creating WebM for ${animationFolder}:`, error.message);
        } finally {
            // Clean up the temporary directory
            await fs.remove(tempDir);
            console.log('🧹 Cleaned up temporary files.');
        }
    }

    async processAllAnimations(customConfig = {}) {
        await this.ensureOutputDir();
        
        const folders = await this.getAnimationFolders();
        console.log(`🚀 Found ${folders.length} animation folders to process`);
        
        if (folders.length === 0) {
            console.log('❌ No animation folders found in objects directory');
            return;
        }

        for (const folder of folders) {
            try {
                await this.createAnimatedWebP(folder, customConfig);
            } catch (error) {
                console.error(`❌ Error processing ${folder}:`, error.message);
            }
        }
        
        console.log('\n🎉 All animations processed!');
    }

    async processSingleAnimation(animationName, customConfig = {}) {
        await this.ensureOutputDir();
        
        const folderPath = path.join(this.objectsDir, animationName);
        const exists = await fs.pathExists(folderPath);
        
        if (!exists) {
            console.log(`❌ Animation folder not found: ${animationName}`);
            return;
        }
        
        await this.createAnimatedWebP(animationName, customConfig);
        console.log('\n🎉 Animation processed!');
    }

    printUsage() {
        console.log(`
🎬 Animated WebP Maker
======================

Usage:
  node index.js                           - Process all animations
  node index.js <animation_name>          - Process specific animation
  node index.js <animation_name> <from> <to> <delay> <quality>

Examples:
  node index.js                           - Process all with default settings
  node index.js cabeza_bote_boomer        - Process only cabeza_bote_boomer
  node index.js cabeza_bote_boomer 1 10 5 100  - Custom settings

Parameters:
  animation_name: Name of the folder in objects/
  from: Starting frame number (default: 1)
  to: Ending frame number (default: 5, or max frames)
  delay: Delay in 1/100 seconds (default: 5 = 20fps)
  quality: WebP quality 0-100 (default: 100)

Current default configuration:
  - Frame range: ${this.config.frameRange.from} to ${this.config.frameRange.to}
  - Delay: ${this.config.delayTime}/100s (${Math.round(100/this.config.delayTime)}fps)
  - Loop: ${this.config.loopCount === 0 ? 'Forever' : this.config.loopCount + ' times'}
  - Quality: ${this.config.outputQuality}%
  - Don't stack frames: ${this.config.effects.dontStackFrames ? 'Yes' : 'No'}
        `);
    }
}

// Main execution
async function main() {
    const maker = new AnimatedWebPMaker();
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        // Process all animations with default config
        await maker.processAllAnimations();
    } else if (args[0] === '--help' || args[0] === '-h') {
        maker.printUsage();
    } else {
        const animationName = args[0];
        
        // Parse custom configuration from command line
        const customConfig = {};
        
        if (args.length >= 3) {
            customConfig.frameRange = {
                from: parseInt(args[1]) || 1,
                to: parseInt(args[2]) || 5
            };
        }
        
        if (args.length >= 4) {
            customConfig.delayTime = parseInt(args[3]) || 5;
        }
        
        if (args.length >= 5) {
            customConfig.outputQuality = Math.max(0, Math.min(100, parseInt(args[4]) || 100));
        }
        
        await maker.processSingleAnimation(animationName, customConfig);
    }
}

// Handle errors
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
});

// Run the program
if (require.main === module) {
    main().catch(console.error);
}

module.exports = AnimatedWebPMaker;