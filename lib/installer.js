"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
let tempDirectory = process.env['RUNNER_TEMP'] || '';
const core = __importStar(require("@actions/core"));
const io = __importStar(require("@actions/io"));
const tc = __importStar(require("@actions/tool-cache"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const semver = __importStar(require("semver"));
const httpm = __importStar(require("typed-rest-client/HttpClient"));
const IS_WINDOWS = process.platform === 'win32';
if (!tempDirectory) {
    let baseLocation;
    if (IS_WINDOWS) {
        // On windows use the USERPROFILE env variable
        baseLocation = process.env['USERPROFILE'] || 'C:\\';
    }
    else {
        if (process.platform === 'darwin') {
            baseLocation = '/Users';
        }
        else {
            baseLocation = '/home';
        }
    }
    tempDirectory = path.join(baseLocation, 'actions', 'temp');
}
function getHub(version) {
    return __awaiter(this, void 0, void 0, function* () {
        core.debug('Downloading hub from Github releases');
        const downloadInfo = yield getDownloadInfo(version);
        let toolPath = tc.find('hub', downloadInfo.version);
        if (toolPath) {
            core.debug(`Tool found in cache ${toolPath}`);
        }
        else {
            let compressedFileExtension = '';
            core.debug(`Tool not found in cache. Download tool from url: ${downloadInfo.url}`);
            let hubBin = yield tc.downloadTool(downloadInfo.url);
            core.debug(`Downloaded file: ${hubBin}`);
            compressedFileExtension = IS_WINDOWS ? '.zip' : '.tgz';
            let tempDir = path.join(tempDirectory, 'temp_' + Math.floor(Math.random() * 2000000000));
            const hubDir = yield unzipHubDownload(hubBin, compressedFileExtension, tempDir);
            core.debug(`hub extracted to ${hubDir}`);
            core.debug(`caching directory containing version ${downloadInfo.version}`);
            toolPath = yield tc.cacheDir(hubDir, 'hub', downloadInfo.version);
        }
        core.debug(`adding hub to path: ${toolPath}`);
        if (IS_WINDOWS) {
            core.addPath(toolPath);
        }
        else {
            core.addPath(path.join(toolPath, 'bin'));
        }
    });
}
exports.getHub = getHub;
function getFileEnding(file) {
    let fileEnding = '';
    if (file.endsWith('.tgz')) {
        fileEnding = '.tgz';
    }
    else if (file.endsWith('.zip')) {
        fileEnding = '.zip';
    }
    else {
        throw new Error(`${file} has an unsupported file extension`);
    }
    return fileEnding;
}
function extractFiles(file, fileEnding, destinationFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        const stats = fs.statSync(file);
        if (!stats) {
            throw new Error(`Failed to extract ${file} - it doesn't exist`);
        }
        else if (stats.isDirectory()) {
            throw new Error(`Failed to extract ${file} - it is a directory`);
        }
        if ('.tgz' === fileEnding) {
            yield tc.extractTar(file, destinationFolder);
        }
        else if ('.zip' === fileEnding) {
            yield tc.extractZip(file, destinationFolder);
        }
        else {
            // fall through and use sevenZip
            yield tc.extract7z(file, destinationFolder);
        }
    });
}
function unzipHubDownload(repoRoot, fileEnding, destinationFolder, extension) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create the destination folder if it doesn't exist
        core.debug(`unzip download ${repoRoot}`);
        yield io.mkdirP(destinationFolder);
        const file = path.normalize(repoRoot);
        const stats = fs.statSync(file);
        if (stats.isFile()) {
            yield extractFiles(file, fileEnding, destinationFolder);
            const hubDir = path.join(destinationFolder, fs.readdirSync(destinationFolder)[0]);
            return hubDir;
        }
        else {
            throw new Error(`file argument ${file} is not a file`);
        }
    });
}
function getDownloadInfo(version) {
    return __awaiter(this, void 0, void 0, function* () {
        let platform = '';
        let fileExtension = IS_WINDOWS ? '.zip' : '.tgz';
        if (IS_WINDOWS) {
            platform = `windows`;
        }
        else {
            if (process.platform === 'darwin') {
                platform = `darwin`;
            }
            else {
                platform = `linux`;
            }
        }
        if (version) {
            core.debug(`download version = ${version}`);
            let validVersion = semver.valid(version);
            if (!validVersion) {
                throw new Error(`No valid download found for version ${version}. Check https://github.com/github/hub/releases for a list of valid releases`);
            }
            //specific version, get that version from releases
            return {
                url: `https://github.com/github/hub/releases/download/v${version}/hub-${platform}-amd64-${version}${fileExtension}`,
                version: version
            };
        }
        else {
            //get latest release
            core.debug('Downloading latest release because no version selected');
            let http = new httpm.HttpClient('setup-hub');
            let releaseJson = yield (yield http.get('https://api.github.com/repos/github/hub/releases/latest')).readBody();
            let releasesInfo = JSON.parse(releaseJson);
            core.debug(`latest version = ${releasesInfo.tag_name}`);
            let latestVersion = releasesInfo.tag_name.substring(1);
            return {
                url: `https://github.com/github/hub/releases/latest/download/hub-${platform}-amd64-${latestVersion}${fileExtension}`,
                version: latestVersion
            };
        }
    });
}
