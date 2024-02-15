
Here are the key points from the release notes:
1.	Run Specified Test Checkbox on Environment Record:
•	Added a checkbox on the Environment record to enforce a minimum of the Run Specified Tests test level during deployment if Apex Classes or Triggers are included.
2.	Automate User Story Manual Tasks with CRT Automation Feature:
•	Introduced a new CRT Automation Deployment Task type to automate manual tasks associated with user stories.
3.	Streamlined Process for Deploying Multiple Deployment Tasks:
•	Added a Data Template Lookup field to the Deployment Task object for identifying and consolidating Deployment Tasks with common Data Templates, leading to faster deployments.
4.	Enhanced Apex Test Result Summary Highlights Panel:
•	Improved the Apex Test Result Summary Highlights Panel to include the Datetime field with Locale support.
5.	Granular Control Over Data Template Deployments:
•	Introduced the option to stop deployment on encountering the first issue during Data Template deployment, allowing for quicker error resolution and re-deployment.
6.	Data Deploy License Enhancement:
•	Added an Edit_Filter_Data_Template_Task custom permission for Users without a Copado Data Deploy License, enabling them to create and edit Data Deploy Filters in user story deployment tasks.
7.	Deployments:
•	Moved the Deploy All and Deploy Outstanding buttons to the Deployment record page, removing the intermediary Credit Balance page. Credit Balance can still be checked from the Account Summary page.
8.	Promotions:
•	Introduced a Submit and Deploy button on the Deployment Details modal after clicking the Create Deployment button on the Promotions page, enabling one-click deployments directly from the Promotion record.
9.	Pipelines:
•	Users of Salesforce pipeline no longer require the Copado Job Engine permission set to open the Deployment Activity page from the Pipeline Manager page.
10.	Quality Integration Framework:
•	Enabled parallel execution of CRT tests for Metadata Pipelines, offering faster commits and promotions by executing tests in parallel based on the CRT plan.
11.	Copado Rollback:
•	Introduced a Rollback button on the Promotion page under specific conditions: Rollback must be enabled in the target org, and the promotion status must be completed.
12.	Key Features and Enhancements in Copado Plan:
•	Removed dependency on Salesforce's Historical Trending functionality for generating Burn Up and Burn Down charts in Copado Plan.
•	Introduced a scheduled batch named SprintSnapshot for taking snapshots of Planned Velocity and Actual Velocity Sprint metrics and saving them under the Sprint Snapshot object.
•	Renamed the Burndown Item object to Sprint Snapshot and added new fields such as Snapshot Date, Planned Velocity, and Actual Velocity.
•	Created an Apex script for populating new Sprint fields with the value of the Total Planned Points field of the user story.
•	Documented data migration steps for migrating data from Sprint Historical Trending Velocity fields to Sprint Snapshot Velocity fields.
•	Created a schedulable batch to take a snapshot from the Sprint object and save it in the Sprint Snapshot object.
•	Developed a script for cleaning up old Sprint Snapshot data to minimize storage consumption.
•	Enabled custom Velocity fields for Planned Points and Actual Points and provided flexibility to add multiple chart components and custom Velocity fields to the Sprint Wall Lightning record page.
•	Offered a real-time experience for Sprint Wall Chart functionality by updating Sprint Wall page to read Velocity data from the Sprint object in real time for 'Today' chart configuration and from Sprint Snapshot object for previous dates.
•	Updated the SprintMetrics Lightning web component of the SprintWall record page to include new ActualVelocity and PlannedVelocity fields.
•	Changed the calculation of Sprint Wall Velocity metrics to use the Total Planned Points field instead of Planned Points field in the user story.
•	Updated fields displayed in Sprint Wall table, Edit Stories modal, and User Stories related list of the Sprint page layout.
•	Added new fields to SprintWall_Columns and SprintWall_MassUpdate field sets for use in Copado Sprint Wall for Salesforce Lightning.
13.	Cloned Permission Sets:
•	If you are using cloned permission sets, add the new fields for the Sprint and Sprint Snapshot objects to the corresponding permission sets. Follow the instructions provided in the 20.15.5 tab in the Permission Set Updates section of the Winter '24 - Upgrade Instructions article.
14.	Sprint Wall Functionality and Burn Up/Burn Down Charts with Historical Trending:
•	If you are using the Sprint Wall functionality and Burn Up/Burn Down charts with Historical Trending, and you want to access existing Sprint records without losing data:
1.	Execute the script to populate the new Sprint Velocity fields in Sprint records. This script will also fix existing Sprint data, including Burn Up and Burn Down charts, due to corrections in Sprint Velocity metrics calculation. Refer to the Execute Script to Populate New Sprint Velocity Fields section of the Winter '24 - Upgrade Instructions article.
2.	Perform the data loader steps to migrate the data from the Sprint Historical Trending Velocity fields to the Sprint Snapshot (formerly BurndownItem) Velocity fields. Refer to the Data Loader Steps to Migrate Historical Trending Data to the Sprint Snapshot Object section of the Winter '24 - Upgrade Instructions article.
15.	All Customers Working with Sprint Wall:
•	Delete the PlannedVelocity__c and ActualVelocity__c fields.
•	Disable the HistoricalTrending functionality in the Sprint object. Ensure you migrate your data (as specified in step 2) before deleting these fields to avoid data loss. Refer to the Additional Instructions - Delete Velocity Fields and then to the Disable Historical Trending for the Sprint Object sections of the Winter '24 - Upgrade Instructions article for further information.
16.	Customers with Cloned Field Sets, Page Layouts, and Lightning Record Pages:
•	Perform Field Set updates to add new fields to the Sprint Wall table, the Edit Stories modal, and the User Stories related list of the Sprint page layout.
•	Update the Sprint Metrics Lightning web component of the Sprint Wall record page to add the new Actual Velocity and Planned Velocity fields. Moreover, add these new fields to the Details tab as well. Refer to the Configure Columns for the Sprint Wall Table, Configure Fields for the Edit Stories Modal in the Sprint Wall, Page Layouts - Sprint, and Lightning Record Pages - Sprint sections of the Winter '24 - Upgrade Instructions article for further information.
Pipelines:
1.	Exclude from Pipeline Option:
•	Ready to Promote or Promote & Deploy options cannot be enabled in a user story if the Exclude from Pipeline option is enabled. The option needs to be deselected to promote or deploy the user story.
2.	Order User Stories By Field:
•	Added under the Advanced Options section of the Pipeline Lightning record page to define the order of user stories during a promotion merge. If not specified, user stories will be ordered by Name in ascending order.
3.	Pipeline Manager Enhancements:
•	Displays information about the stage for every environment of the pipeline.
•	Configure Pipeline button is now only available for Salesforce Metadata Pipelines.
4.	Pipeline Connection Object:
•	Renamed the Branch field to Source Branch and updated help text for the Destination Branch field.
5.	New Options in Pipeline Manager:
•	Select user stories for promotion, promote them to the next environment, automatically promote and deploy user stories, and perform validations for forward and back promotions.
6.	Validation and Promotion:
•	Changes cannot be validated in the last environment of the pipeline.
•	Validation of user stories without metadata changes creates a Promotion record but does not start execution automatically.
Promotion:
1.	Order User Stories By Field:
•	Added under the Information section of the Promotion Lightning record page to define the order of user stories during a promotion merge. Promotion record's order overrides Pipeline record's order.
2.	Test Tab:
•	Now displays auto-created tests for promotions.
3.	Open Pull Request Button:
•	Always visible in Promotion records and performs validations before redirecting to create a pull request in the Git repository.
4.	EnvironmentAndPipelinePlatformMustBeSame Validation Rule:
•	Deactivated in the Pipeline Connection object to reuse the same environment for different platform pipelines.
5.	Exclude Specific Changes:
•	Can exclude changes from a promotion from the Promotion record itself.
6.	New Permission and Enhancements for Promotion Creation:
•	Added a new permission named Remove metadata from Promotion to exclude changes from a promotion.
•	Enhanced the process to create a promotion from the User Story record based on project and release.
7.	Validation on Add User Stories Button:
•	Checks if all user stories included in the promotion belong to the same project and release.
8.	Promotion Tabs:
•	Added Job Executions and Others tabs, rearranged the tabs order.
9.	Cancelled Promotions:
•	Recommend not modifying or updating cancelled promotions but creating a new one instead.
User Stories:
1.	User Story Page Updates:
•	Last Validation Deployment field no longer available for Copado DevOps Platform.
•	Compliance section of the Test tab no longer available for Copado DevOps Platform.
2.	Related Lists Update:
•	Several related lists removed or rearranged in the User Story record.
3.	Open Org Button:
•	Visible in User Story records when Salesforce Source Format Pipelines are used.
4.	Error Message for Incorrect Button Use:
•	Error message added when using an incorrect button in User Story records.
5.	Automatic Update of User Story Status:
•	Status of a user story can be automatically updated after successful promotion deployment.
Here are the key features and enhancements in the Copado DevOps Platform:
User Story Bundles:
1.	Functionality Introduction:
•	User Story Bundle feature allows for the promotion and back-promotion of a large set of user stories per release, simplifying and speeding up the production release process.
2.	New Custom Permission:
•	Create User Story Bundle permission allows users to create user story bundles and needs to be assigned to corresponding permission sets or profiles.
3.	Add/Remove User Stories:
•	User stories can be added or removed from the bundle when it's not locked (Package Version record is Open), with considerations for project, environment, and credentials.
4.	Status Handling:
•	User Story Bundles can now be cancelled from both the User Story Bundle and Package Version records, with related actions and status updates.
Submit User Stories:
1.	New Functionality:
•	Submit User Stories functionality allows using the Submit button in the User Story record to move the user story to the next environment immediately or schedule it for later.
Copado Actions:
1.	Behavior Modification:
•	Action's callback now reads data from the Result record of the last job step of the job template used in the job execution.
2.	Promotion Deployment Sequence:
•	Promotion Deployment action now has an updated execution order, covering the entire deployment process, including quality gate steps before and after deployment.
3.	Additional Parameters:
•	Several new parameters and options are added for Commit, Promote, and PromotionDeployment actions, enhancing customization and control over the deployment process.
4.	Payload Field Addition:
•	A new field named Payload is added under the Automation Event object and added to permission sets for the Submit User Stories action and connector.
5.	Promotion Validations:
•	Enhanced validations in the Promotion action support the Release feature in promotion, ensuring consistency in project and release assignments.
6.	Base Branch Update:
•	Base Branch field in the User Story record is now automatically updated during the commit process.
7.	Queuing Behavior Update:
•	Promotions and deployments are now automatically queued by default to prevent parallel executions, with an option to disable this behavior.
Quality Integration Framework:
1.	Tests Tab Update:
•	Tests tab on Promotion records now displays additional features like Search box, refresh and filter icons, and relevant columns.
2.	Permission Set Changes:
•	Quality Gates permission sets are deprecated and replaced with Quality Integration Framework permission sets for better integration.
3.	Automated Status Update:
•	Consolidated Result status is automatically updated by Copado DevOps Platform based on job execution, simplifying the status tracking process.
4.	Quality Gate Rules Update:
•	Quality gate rules configured for PromotionDeployment action are no longer run during a validation deployment, affecting only this specific scenario.
Test Tools:
1.	New Fields:
•	Added two new fields to the Test Tool custom metadata type for handling auto-creation and activation of quality gates tests.
•	Automate Test Readiness indicates if a test can be marked as 'Ready' without manual intervention.
•	Test Readiness Logic accommodates the name of the Apex class for test readiness logic.
Tests:
1.	List Views:
•	Additional fields now visible in the All and Recently Viewed list views of the Tests object.
2.	Run Button Visibility:
•	The Run button in Test records now displays only when the test is Ready to Run and a user story is defined for it.
3.	Latest Result Status:
•	Added a Latest Result Status field in the highlight panel of the Tests record to indicate the test's latest execution status.
Copado Continuous Delivery:
1.	Excluded User Stories:
•	User stories marked as 'Excluded from Pipeline' are not considered for automatic promotions or back-promotions triggered by Automation Rules.
Notification Center:
1.	Improved Notifications:
•	Notification Center now sends notifications via email when the Run Test Copado action is executed, providing updates on test or quality gate completion, failure, or cancellation.
Deployment:
1.	Flexible Deployment:
•	User stories no longer need committed changes to be deployed; as long as they contain deployment steps, they can be deployed based on the specified Execution Sequence field.
Deployment Steps:
1.	Enhanced Functionality:
•	Deployment steps can now be previewed, added, edited, reordered, or removed before deployment from the Promotion record through various buttons.
•	Manual Task deployment steps improved for more flexibility in task creation and management.
App Detector Component:
1.	Dynamic Component:
•	Updated the App Detector component to be dynamic, allowing it to be added to any Lightning record page and providing warnings when accessing records from incorrect applications.
Commit Page:
1.	Custom Commit Experience:
•	Copado now allows overriding the out-of-the-box Commit experience with a custom Commit Changes page.
Git Snapshots:
1.	New Functionality:
•	Introduced Git Snapshot functionality for creating a connection between a cloud environment and a Git repository/branch.
•	Added a new permission set, Git Snapshot Admin, to manage access to Git snapshots.
•	Improved visibility and management of Snapshot Commits related to Git snapshots.
Automations:
1.	Configuration Tab:
•	Added a Configuration tab to the Automation Rule page for configuring scope and criteria for automation rules.
•	Back Promotion Scope section added to automation rules for specifying environments during back promotions.
•	Ability to specify the status displayed in a user story after deployment using automation rules.
Credentials:
1.	Validation Component Update:
•	Validation component in Credential records now considers SFDX environments as Salesforce environments, removing Non Salesforce Credential warnings.
Overlap Awareness:
1.	New Feature:
•	Introduced Overlap Awareness feature for Source Format Pipelines to check potential conflicts in metadata or Git metadata.
•	Added functionality to open pull requests between feature branches of user stories with potential conflicts.
Field History Tracking:
1.	History Related List:
•	Added the History related list to Automation Rules, Quality Gate Rule, and Quality Gate Condition page layouts for enabling field history tracking
key features and enhancements in the Salesforce Source Format Pipelines:
1.	Vlocity Integration:
•	Seamlessly integrate Vlocity DevOps within source format pipelines.
•	Perform tasks like committing, promoting, and deploying Vlocity datapacks across multiple environments within the same pipeline.
•	Synchronize Salesforce metadata and Vlocity/SFI changes for deployment.
•	Create snapshots of Vlocity datapacks in Vlocity-enabled SFDX pipelines.
2.	Core Enhancements:
•	Introduce Git Snapshots for Environment Backup for on-demand or scheduled backups of environment metadata.
•	Rollback feature provides flexibility to select changes for rollback, with improved Result Viewer Component for better visibility.
•	Apex Tests in Rollback support Apex Test level Run Specified Tests.
•	Enhanced Cancel Conflict Resolution for conflict resolution customization.
•	Data Deploy Custom Steps enable seamless deployment of data templates through pipelines.
•	Concurrent Action Execution optimizes workflows by queuing actions impacting the same environment branch.
3.	User Story Bundle:
•	Apex tests are unified into a single test in User Story Bundles for streamlined testing.
•	Apex Test Test Tool custom metadata type updated for User Story Bundle Tests Unifier Logic.
4.	Commit Enhancements:
•	Introduce Get Items button for refreshing org metadata cache.
•	Full operation for Muting Permission Sets and Custom Object metadata type commits.
•	Configure gitDepth parameter for customized Git branch depth.
5.	Deploy Improvements:
•	Refactor Promote and Deploy functionality with new parameters.
•	Add Initialize Salesforce Project button for creating SFDX projects in Git repositories.
6.	Test Enhancements:
•	Execute Apex Test Suites as part of user stories.
•	Validate required permission sets for job and function executions.
7.	System Property Enhancements:
•	Add Is Public checkbox for System Property to share properties across the organization.
8.	Quality Gate Rules:
•	Display Quality Gate Rules on Extension Configuration record page.
9.	Salesforce Source Format Pipeline Packaging:
•	Support for larger packages with polling mechanism.
•	Improvement in Package and Package Version Maintenance.
•	Installation options for package distribution.
key features and enhancements in quality tools based on the provided information:
General Key Features for Quality Tools:
1.	Updated Error Message for Test Failures:
•	Improved error message display when a test fails, providing clearer instructions for reviewing errors.
2.	Automatic Status Update for Failed Tests:
•	When tests fail or acceptance criteria are not met, the job execution status is automatically updated to Error, and the test result is marked as Failed.
3.	Enhanced Usability and Configurability for PMD Tests:
•	Simplified process for PMD tests for Salesforce Source Format Pipelines.
•	Ability to generate default ruleset files, import and display multiple custom ruleset files, add new rules, modify existing ones, add custom categories, and activate/deactivate rules from the UI.
•	Support for running code analysis for multiple rule references (Java, Apex, Kotlin).
PMD Tests Specific Enhancements:
1.	Unified Test Solution for User Story Bundles:
•	Unified PMD tests created for multiple user stories with the same extension configuration and acceptance criteria.
2.	Behavioral Changes in PMD Quality Gate for Destructive Changes:
•	Behavior modification in the execution of PMD quality gate for destructive changes.
•	PMD scan and acceptance criteria evaluation are skipped for user stories with only destructive changes.
Copado Robotic Testing Tests Enhancements:
1.	Improved Log File Handling:
•	Complete log files for CRT test executions stored in the test Result record.
•	Display of error messages in the Result record for failed job executions.
2.	Enhanced Test Configuration within Copado:
•	New section for Variable and Execution Parameters to configure CRT tests directly from Copado Test records.
•	Parallel execution of CRT tests available for Copado DevOps Platform, leading to faster commits and promotions.
Copado Compliance Hub (CCH) Updates:
1.	CCH for Salesforce Source Format Pipelines:
•	Compliance Hub functionality extended to Salesforce Source Format Pipelines.
•	Two new objects created for Compliance Rule and Compliance Rule Violation.
•	Permission sets created for CCH administration and user roles.
2.	Limitations for CCH Tests:
•	Limitations include environment scans, schedule jobs, cloning of CCH Extension Configuration records, and migration of compliance rules from Salesforce Metadata Pipelines to Salesforce Source Format Pipelines.
key features and enhancements in Copado Essentials:
Kanban View of Work Items:
•	Provides a visual roadmap for managing tasks and work items.
•	Organizes work items into cards on a board for clear, at-a-glance overview.
•	Enhances transparency and streamlines workflow, especially for agile methodologies.
Deployment Updates:
•	Customizable deployment options on an individual basis.
•	Introduction of deployment tasks for pre/post-deployment operations.
•	Back deployment feature enables moving selected work items or deployments from higher to lower environments.
Cloning and Conflict Resolution:
•	Cloning a work item into a new deployment for deploying the same item to different orgs or back-promoting it to a sandbox.
•	Merge conflict resolution support within the application.
Data Template Enhancements:
•	New sharing feature with two access levels: None and Manage.
•	Data templates now active by default during import or creation.
•	Ability to replace existing user filters and share templates among multiple users.
Destructive Changes Updates:
•	Removal of a component from Git with a work item during destructive changes.
•	Alignment between Git repository and Salesforce environment during layout assignment removals.
Integrations:
•	Bi-directional integration with Azure Boards.
•	Automatic notifications, messages, and updates to Slack.
•	Integration with Microsoft Teams for deployment notifications.
•	Integration with AWS Code Commit for code repository collaboration.
Merge Deployments:
•	Merge two deployments or work items including tests when the test level is set to Run Specified tests.
Checkmarx and CodeScan Access:
•	Essentials Plus users can access Checkmarx and CodeScan integrations.
API Version Update:
•	Copado Essentials supports Salesforce metadata API version 59.
New Team Lead Role:
•	Team Lead role introduced with specific responsibilities related to helping the team owner.
Support of Identity Verification Metadata:
•	Identity verification feature implemented to enhance security and maintain trust with customers.
New Purchase Experience:
•	Upgraded self-service purchase UX for easier plan viewing, comparison, upgrade, and checkout.
Additional Enhancements:
•	Renaming of Copado Essentials plans to Essentials Basic and Essentials Plus.
•	Ability for team users to share a Git org.
•	Cherry-picking changes during rollback from a snapshot.
•	Email notifications for work item approvals/rejections and task assignments/reviews.
•	Activation of Essentials+ trial for free users.
•	Exporting deployments in Excel or CSV format.
•	Improved handling of labels in CI jobs.
•	Seamless synchronization of Salesforce user names with Essentials account.
•	Support for new metadata types like Financial Services Cloud and GenderIdentity standard value sets.
bug fixes and enhancements in Copado DevOps Platform, Salesforce Metadata Pipelines, Quality Tools, and Copado Connect are detailed as follows:
Copado DevOps Platform:
•	Quality gates configured to execute "after" commit or promotion now update fields in Copado records properly.
•	Vlocity metrics no longer update or recalculate when the Burndown chart is frozen.
•	User Story and Promotion Lightning record pages can now be cloned without errors.
•	Deployment Activity page displays all activity-related information properly.
•	Quality gates triggering auto-creation of tests now handle existing tests appropriately.
•	Auto-creation of tests failure now updates the status and displays error messages.
•	Commit action from CLI now creates and executes job execution for configured quality gates.
•	Pipeline Manager icons show the latest status of Salesforce Source Format Pipelines deployments.
•	Continuous Delivery wizard displays stages in the correct order.
•	Middle mouse click can now be used within the Pipeline Manager to open links in a new tab.
•	Related Git Snapshot records can be properly edited from the related list on the Git Repository page.
•	Promotions containing only user stories without metadata can be executed correctly.
•	Back promotions now include required deployment steps.
•	Creation of a new pipeline without defined connections no longer results in an error.
•	Pipeline Manager now properly displays Release records alphabetically.
Salesforce Metadata Pipelines:
•	Deployment steps now work properly with CCD behavior set to complete them automatically.
•	Set Version button is now visible on Copado Release Records pages.
•	Deployment steps added by connection behavior automation are created in the correct order.
•	Refreshing metadata types on the Commit page now works properly.
•	Default server URL has been updated in the package.
•	Apex test results from credential record can be reviewed in the Summary section.
•	Sprint burn-up and burn-down charts now exclude weekend days correctly.
•	Deleting one deployment step no longer affects the remaining steps' successful execution.
•	New Test button is visible on the Test tab in the User Story record.
•	Fields in Copado records are now properly updated after commit or promotion.
Quality Tools:
•	Copado CI/CD for Salesforce executes CRT tests in the destination environment.
•	CRT tests executed from Copado are now displayed under the Regression tab regardless of user story status.
•	Selected Test Cases field info message no longer displays if filled in Test record.
•	PMD tests are executed in the destination environment after Promotion Deployment action.
•	CRT and PMD test statuses are properly displayed according to job execution status.
•	Account records are no longer queried during Quality Tools package installation.
Copado Connect:
•	Copado Connect integration activation no longer throws errors.
•	JQL filter is now available by default during Copado integration activation.
•	Copado Connect "Release" is now synced between JIRA and Salesforce.
•	Integration log is now created without errors.
•	Blank user story records no longer created when issue of unmapped type is created in Jira.
•	Integration logs are now linked to Copado Integration record.
•	Project field now displayed when creating a new Copado Integration record.
•	Illegal value for primitive error is not displayed while activating integration.
•	Sync between Jira and Copado no longer fails if Jira story includes comments.
•	Mapping multiple Jira issue types to Copado user story is now fixed.
•	Real-time syncing issue from Copado to Jira with Copado Connect v1.23 is resolved






















Key Features and Enhancements in Copado Essentials:
•	Kanban view for managing tasks and work items.
•	Customizable deployment options and deployment tasks.
•	Back deployment to sync orgs.
•	Cloning work items into new deployments.
•	Conflict resolution support.
•	Enhanced data template sharing and management.
•	Destructive changes updates.
•	New integrations with Azure Boards, Slack, Microsoft Teams, and AWS Code Commit.
•	Merge deployments feature.
•	Access to Checkmarx and CodeScan for Essentials Plus users.
•	Updated Salesforce metadata API version 59.
•	Introduction of the Team Lead role.
•	Support for Identity Verification Metadata.
•	New purchase experience.
•	Various other enhancements.
Bug Fixes in Copado DevOps Platform:
•	Proper update of fields after commit/promotion.
•	Correct handling of Vlocity metrics.
•	Cloning of User Story and Promotion Lightning record pages.
•	Proper display of Deployment Activity page information.
•	Handling of auto-creation of tests and execution failures.
•	Proper execution of Commit action from CLI.
•	Correction of Pipeline Manager icons.
•	Order display in Continuous Delivery wizard.
•	Correction of Deployment Steps behavior.
•	Resolution of various UI and functionality issues.
Bug Fixes in Salesforce Metadata Pipelines:
•	Correct behavior of deployment steps and version set button.
•	Proper ordering of deployment steps and metadata refresh.
•	Update of default server URL and Apex test results handling.
•	Correction of Sprint burn-up and burn-down chart behavior.
•	Fix for multiple deployment steps deletion issue.
•	Proper visibility of New Test button and other UI enhancements.
Bug Fixes and Enhancements in Quality Tools:
•	Execution and display of CRT tests in destination environment.
•	Proper handling of CRT and PMD tests status.
•	Resolution of PMD execution error and other UI fixes.
•	Proper execution of quality gate rules after deployment.
Bug Fixes and Enhancements in Copado Connect:
•	Activation and integration log creation without errors.
•	Syncing of Copado Connect "Release" between JIRA and Salesforce.
•	Fix for blank user story records creation issue.
•	Correction of integration mapping and real-time syncing issues.
These improvements and fixes contribute to a more efficient and stable workflow within Copado Essentials, addressing various issues and enhancing functionality across different modules and integrations.


