document.addEventListener("DOMContentLoaded", () => {
  const sidebarForm = document.querySelector("#sidebar-form");
  if (!sidebarForm) return;

  sidebarForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(sidebarForm);

    const goals = formData.getAll("goals");
    const tags = formData.getAll("tags");
    const dueBefore = formData.get("dueBefore");
    const sort = formData.get("sort");
    const show = formData.get("show");

    console.log(`goals: ${goals}`);
    console.log(`tags: ${tags}`);
    console.log(`duebeofer: ${dueBefore}`);
    console.log(`sort:`, sort);
    console.log(`show:`, show);

    const params = new URLSearchParams();

    if (goals.length) params.set("goals", goals.join(","));
    if (tags.length) params.set("tags", tags.join(","));
    if (dueBefore) params.set("dueBefore", dueBefore);
    if (sort) params.set("sort", sort);
    if (show) params.set("show", show);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
    window.location.reload();
  });

  const resetBtn = document.getElementById("form-reset-btn");

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      const sidebarForm = document.querySelector("#sidebar-form");
      sidebarForm
        .querySelectorAll('input[name="goals"]')
        .forEach((el) => (el.checked = false));
      sidebarForm
        .querySelectorAll('input[name="tags"]')
        .forEach((el) => (el.checked = false));
      sidebarForm.querySelector('input[name="dueBefore"]').value = "";
      sidebarForm.querySelector('select[name="sort"]').selectedIndex = 0;
      sidebarForm.querySelector('select[name="show"]').selectedIndex = 0;
    });
  }
});
