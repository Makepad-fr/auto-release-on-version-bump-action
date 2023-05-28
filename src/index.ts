import * as core from '@actions/core';
import * as github from '@actions/github';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import fs from 'fs';

/**
 * Get the version from the workspace's package.json file
 * @returns The version from the package.json file
 */
function getVersion(): string {
    return JSON.parse(fs.readFileSync('./workspace/package.json', 'utf-8')).version;
}

/**
 * Checks if the given version is a pre-release or not. 
 * @param version The version to check if it is a pre-rlease or not
 * @returns True if the given version is pre-release
 */
function isPreReleaseVersion(version: string) {
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
function isPreRelease(newVersion: string, input: string): boolean {
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
function prepareReleaseName(oldVersion: string, newVersion: string, input: string): string {
    return input.replace(/\$newVersion/g, newVersion).
        replace(/\$oldVersion/g, oldVersion);
}

/**
 * The main function that runs the GitHub action
 */
async function run(): Promise<void> {
    try {
        const token: string = core.getInput('token');
        const octokit = github.getOctokit(token);
        const { owner, repo } = github.context.repo;

        await io.mkdirP('workspace');
        // Always clones with the default branch
        await exec.exec('git', ['clone', `https://github.com/${owner}/${repo}.git`, 'workspace'], { silent: true });

        const newVersion: string = getVersion();
        console.log(`New version: ${newVersion}`);

        await exec.exec('git', ['checkout', 'HEAD^'], { cwd: 'workspace', silent: true });
        const oldVersion: string = getVersion();
        console.log(`Old version: ${oldVersion}`);

        if (newVersion === oldVersion) {
            throw new Error('Version number in package.json did not increase');
        }

        console.log('Creating new release...');
        const prerelease = isPreRelease(newVersion, core.getInput('pre-release'));
        await octokit.rest.repos.createRelease({
            owner,
            repo,
            tag_name: prepareReleaseName(oldVersion, newVersion, core.getInput('tag-name')),
            name:  prepareReleaseName(oldVersion, newVersion, core.getInput('name')),
            body: prepareReleaseName(oldVersion, newVersion, core.getInput('body')),
            draft: core.getBooleanInput('draft'),
            prerelease,
            generate_release_notes: ((!prerelease) && (core.getBooleanInput('generate-release-note'))),
        });
        console.log('Release created');
    } catch (error) {
        core.setFailed(error as Error);
    }
}



run();

