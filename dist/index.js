"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const exec = __importStar(require("@actions/exec"));
const io = __importStar(require("@actions/io"));
const fs_1 = __importDefault(require("fs"));
/**
 * Get the version from the workspace's package.json file
 * @returns The version from the package.json file
 */
function getVersion() {
    return JSON.parse(fs_1.default.readFileSync('./workspace/package.json', 'utf-8')).version;
}
/**
 * Checks if the given version is a pre-release or not.
 * @param version The version to check if it is a pre-rlease or not
 * @returns True if the given version is pre-release
 */
function isPreReleaseVersion(version) {
    return /-\w+$/.test(version);
}
/**
 * Verify if the current release should be marked as a pre-release or not.
 * If the pre-release value is set to "true" or "false" it will return their boolean value
 * Otherwise, it will be calculated from the new version from package.json
 * @param newVersion The new version
 * @param input The user input from yaml file
 * @returns True if the release should be marked as a pre-release, false otherwise
 */
function isPreRelease(newVersion, input) {
    switch (input) {
        case "true": return true;
        case "false": return false;
        case "auto":
        default: return isPreReleaseVersion(newVersion);
    }
}
/**
 *
 * @param oldVersion The old version in the package.json
 * @param newVersion The new version in the package.json
 * @param input
 */
function prepareReleaseName(oldVersion, newVersion, input) {
    return input.replace(/\$newVersion/g, newVersion).
        replace(/\$oldVersion/g, oldVersion);
}
/**
 * The main function that runs the GitHub action
 */
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = core.getInput('token');
            const octokit = github.getOctokit(token);
            const { owner, repo } = github.context.repo;
            yield io.mkdirP('workspace');
            // Always clones with the default branch
            yield exec.exec('git', ['clone', `https://github.com/${owner}/${repo}.git`, 'workspace'], { silent: true });
            const newVersion = getVersion();
            console.log(`New version: ${newVersion}`);
            yield exec.exec('git', ['checkout', 'HEAD^'], { cwd: 'workspace', silent: true });
            const oldVersion = getVersion();
            console.log(`Old version: ${oldVersion}`);
            if (newVersion === oldVersion) {
                throw new Error('Version number in package.json did not increase');
            }
            console.log('Creating new release...');
            const prerelease = isPreRelease(newVersion, core.getInput('pre-release'));
            yield octokit.rest.repos.createRelease({
                owner,
                repo,
                tag_name: prepareReleaseName(oldVersion, newVersion, core.getInput('tag-name')),
                name: prepareReleaseName(oldVersion, newVersion, core.getInput('name')),
                body: prepareReleaseName(oldVersion, newVersion, core.getInput('body')),
                draft: core.getBooleanInput('draft'),
                prerelease,
                generate_release_notes: ((!prerelease) && (core.getBooleanInput('generate-release-note'))),
            });
            console.log('Release created');
        }
        catch (error) {
            core.setFailed(error);
        }
    });
}
run();
//# sourceMappingURL=index.js.map