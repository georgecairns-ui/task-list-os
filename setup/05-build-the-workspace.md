# Step 5: build the workspace

Goal: their documents have an obvious home, and you know where everything is.

The `files/` folder comes with a starting structure. Each folder has a short README explaining what goes in it:

```
files/
  01-admin        company documents, insurance, legal, policies, logins list (names only, never passwords)
  02-clients      one folder per client or customer
  03-sales        leads, proposals, quotes, price lists
  04-marketing    brand, website, social media, campaigns
  05-finance      invoices, receipts, statements, tax, payroll
  06-operations   how things are done: processes, suppliers, equipment
  07-team         people, contracts, rotas, training
  08-projects     anything with a start and an end that isn't a single client
  99-archive      old things worth keeping. Nothing is ever deleted
```

## 5.1 Fit it to the business

Using what you learned in step 4, suggest small changes, then make them once they agree. For example:

- A shop might rename `02-clients` to `02-customers` and add `09-stock`.
- A solo consultant with no staff can leave `07-team` empty.
- A trades business might add `09-jobs` with one folder per job.

Keep the numbers, so the order stays the same everywhere. Don't over-engineer it. If a folder isn't needed, leave it in place; an empty folder costs nothing.

Create a folder in `02-clients` for each key client from `context/people.md`, if they'd like that.

## 5.2 If their documents already live somewhere else

Many businesses keep everything in Google Drive, OneDrive or Dropbox already. Don't move anything. Instead:

1. Ask where the main folders are.
2. Fill in the "Where things really live" table in `files/README.md` (for example "Client work: Google Drive, Shared drives, Clients").
3. If cloud files are connected, check you can see those folders.

Then `files/` is for things you create together (meeting notes, drafts, exports), and the table tells you where to look for everything else.

## 5.3 If they have an existing folder on this computer

If step 1 found an existing business folder nearby, ask whether they'd like to keep using it as it is, or have help tidying it into this structure later using `skills/file-it`. Never move or rename their files during setup.

## 5.4 Finish

Tell them in one or two lines what the structure is and that you'll suggest where to save things as you go. Tick step 5 in `setup/progress.md`.
