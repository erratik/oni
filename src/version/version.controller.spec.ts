import { VersionController } from './version.controller';
import { VersionService } from './version.service';

describe('VersionController', () => {
  let versionController: VersionController;
  let versionService: VersionService;

  beforeEach(() => {
    versionService = new VersionService();
    versionController = new VersionController(versionService);
  });

  describe('getVersion', () => {
    it('should return the API version', async () => {
      const result = process.env.npm_package_version;

      expect(await versionController.getVersion()).toBe(result);
    });
  });
});
