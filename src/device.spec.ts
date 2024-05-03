import assert from 'assert';
import chai from 'chai';
import chaiFiles from 'chai-files';
import fsExtra from 'fs-extra';
import path from 'path';

import * as rokuDeploy from './index';

chai.use(chaiFiles);

const expect = chai.expect;
const file = chaiFiles.file;

//these tests are run against an actual roku device. These cannot be enabled when run on the CI server
describe('device', function device() {
    let options: rokuDeploy.RokuDeployOptions;
    let originalCwd = process.cwd();

    beforeEach(() => {
        options = rokuDeploy.getOptions();
        options.rootDir = './testProject';

    });

    afterEach(() => {
        //restore the original working directory
        process.chdir(originalCwd);

        //delete the output file and other interum files
        let filePaths = [
            path.resolve(options.outDir),
            '.tmp'
        ];
        for (let filePath of filePaths) {
            try {
                fsExtra.removeSync(filePath);
            } catch (e) { }
        }
    });

    this.timeout(20000);

    describe('deploy', () => {
        it('works', async () => {

            let response = await rokuDeploy.deploy(options);
            assert.equal(response.message, 'Successful deploy');
        });

        it('Presents nice message for 401 unauthorized status code', async () => {
            options.password = 'NOT_THE_PASSWORD';
            try {
                let response = await rokuDeploy.deploy(options);
            } catch (e: any) {
                assert.equal(e.message, 'Unauthorized. Please verify username and password for target Roku.');
                return;
            }
            assert.fail('Should have rejected');
        });
    });

    describe('deleteInstalledChannel', () => {
        it('works', async () => {
            try {
                // Deletes the current installed channel
                await rokuDeploy.deleteInstalledChannel(options);
                // Run again to make sure it doesn't fail when the channel is already deleted
                await rokuDeploy.deleteInstalledChannel(options);
            } catch (e:any) {
                assert.fail(e.message);
            }
        });
    });

    describe('rekeyDevice', () => {
        it('works', async () => {
            try {
                await rokuDeploy.rekeyDevice(options);
            } catch (e: any) {
                assert.fail(e.message);
            }
        });
    });

    describe('deployAndSignPackage', () => {
        it('works', async () => {
            expect(file(await rokuDeploy.deployAndSignPackage(options))).to.exist;
        });
    });
});
