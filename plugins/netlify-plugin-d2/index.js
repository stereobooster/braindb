export const onPreBuild = async function ({ utils: { run } }) {
  // HOMEBREW_NO_AUTO_UPDATE=1
  await run.command("brew install d2");
};
