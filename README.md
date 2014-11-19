fhirball
========
fhirball is a repository for HL7 FHIR resources. Provides a RESTful api and uses MongoDB cache for persistence.



Installation
------------
To install fhirball:

    npm install fhirball

Test
----
To execute unit tests:

    npm install
    mocha --recursive ./test/spec

To execute integration tests, performing CRUD operations on each sample resource:

    mocha --recursive ./test/e2e

Integration tests assume a mongod instance running on localhost.

Copyright
---------
Copyright 2014 Black Pear Software Ltd.

This material contains content from HL7. Unless otherwise noted in the filename, sample FHIR resources in 
test/e2e/data are © HL7.org 2011+ and used under license (http://www.hl7.org/implement/standards/fhir/license.html)

License
-------
fhirball is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

fhirball is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

Acknowledgements
----------------
Supported by [Black Pear Software](www.blackpear.com)
 
Additional contributions from [freshEHR](http://freshehr.com/)

